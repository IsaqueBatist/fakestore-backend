import crypto from "crypto";
import { RequestHandler } from "express";
import { Knex as KnexInstance } from "../../database/knex";
import { EtableNames } from "../../database/ETableNames";
import { UnauthorizedError } from "../../errors";
import { RedisService } from "../services/RedisService";
import { dispatchWebhook } from "../services/WebhookService";
import { PLAN_CONFIG, DEFAULT_GRACE_PERIOD_DAYS } from "../constants";
import type { ITenant } from "../../database/models";
import type { Knex as KnexType } from "knex";

/**
 * Middleware that resolves the tenant from the x-api-key header and provides
 * a lazy RLS-scoped transaction via req.getTenantTrx().
 *
 * - Tenant lookup: x-api-key -> SHA-256 hash -> Redis cache (5min) -> DB fallback
 * - Transaction: Opened lazily only when a controller needs DB access
 * - RLS: SET LOCAL app.current_tenant_id scopes all queries within the transaction
 */
export const ensureTenant: RequestHandler = async (req, res, next) => {
  const apiKey = req.headers["x-api-key"] as string | undefined;

  if (!apiKey) {
    throw new UnauthorizedError("errors:missing_api_key");
  }

  // Hash the received API key for lookup
  const apiKeyHash = crypto.createHash("sha256").update(apiKey).digest("hex");

  // Lookup tenant: Redis cache first, then DB
  let tenant = await RedisService.get<ITenant>(`tenant:hash:${apiKeyHash}`);

  if (!tenant) {
    const dbTenant = await KnexInstance(EtableNames.tenants)
      .where("api_key_hash", apiKeyHash)
      .where("is_active", true)
      .first();

    if (!dbTenant) {
      throw new UnauthorizedError("errors:invalid_api_key");
    }

    tenant = dbTenant as ITenant;

    await RedisService.set(`tenant:hash:${apiKeyHash}`, tenant, 300);
  }

  // Lazy downgrade check: trial expiry and grace period (fire-and-forget, non-blocking)
  let effectivePlan = tenant.plan;
  let effectiveRateLimit = tenant.rate_limit;

  const now = new Date();

  // Check trial expiry: no subscription and trial ended → downgrade to sandbox
  if (tenant.trial_ends_at && !tenant.subscription_id) {
    if (new Date(tenant.trial_ends_at) < now && tenant.plan !== "sandbox") {
      effectivePlan = "sandbox";
      effectiveRateLimit = PLAN_CONFIG.sandbox.rate_limit;
      // Fire-and-forget background downgrade
      KnexInstance(EtableNames.tenants)
        .where("id_tenant", tenant.id_tenant)
        .update({ plan: "sandbox", rate_limit: PLAN_CONFIG.sandbox.rate_limit })
        .then(() => RedisService.invalidate(`tenant:id:${tenant!.id_tenant}`))
        .catch(() => {});
    }
  }

  // Check grace period: plan_expires_at + grace_period_days passed → downgrade to sandbox
  if (tenant.plan_expires_at && tenant.plan !== "sandbox") {
    const graceEnd = new Date(tenant.plan_expires_at);
    graceEnd.setDate(graceEnd.getDate() + (tenant.grace_period_days || DEFAULT_GRACE_PERIOD_DAYS));
    if (now > graceEnd) {
      effectivePlan = "sandbox";
      effectiveRateLimit = PLAN_CONFIG.sandbox.rate_limit;
      KnexInstance(EtableNames.tenants)
        .where("id_tenant", tenant.id_tenant)
        .update({ plan: "sandbox", rate_limit: PLAN_CONFIG.sandbox.rate_limit, plan_expires_at: null })
        .then(() => RedisService.invalidate(`tenant:id:${tenant!.id_tenant}`))
        .catch(() => {});
    }
  }

  req.tenant = {
    id: tenant.id_tenant,
    plan: effectivePlan,
    rateLimit: effectiveRateLimit,
  };

  // Initialize pending webhooks array for post-commit dispatch
  req.pendingWebhooks = [];

  // Lazy RLS-scoped transaction: only opened when the controller calls getTenantTrx()
  let trx: KnexType.Transaction | null = null;
  let trxSettled = false;

  req.getTenantTrx = async () => {
    if (!trx) {
      trx = await KnexInstance.transaction();
      await trx.raw(`SET LOCAL app.current_tenant_id = '${tenant!.id_tenant}'`);

      // Auto commit/rollback when the response finishes
      res.on("finish", async () => {
        if (trxSettled) return;
        trxSettled = true;
        try {
          if (res.statusCode >= 400) {
            await trx!.rollback();
          } else {
            await trx!.commit();
            // Dispatch pending webhooks only after successful commit
            for (const wh of req.pendingWebhooks) {
              dispatchWebhook(wh.tenantId, wh.event, wh.payload).catch(() => {});
            }
          }
        } catch {
          // Transaction may already be settled
        }
      });

      // Safety net: rollback on connection close without finish
      res.on("close", async () => {
        if (trxSettled) return;
        trxSettled = true;
        try {
          await trx!.rollback();
        } catch {
          // Transaction may already be settled
        }
      });
    }
    return trx;
  };

  return next();
};
