import crypto from "crypto";
import { RequestHandler } from "express";
import { Knex as KnexInstance } from "../../database/knex";
import { EtableNames } from "../../database/ETableNames";
import { UnauthorizedError } from "../../errors";
import { RedisService } from "../services/RedisService";
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

  req.tenant = {
    id: tenant.id_tenant,
    plan: tenant.plan,
    rateLimit: tenant.rate_limit,
  };

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
