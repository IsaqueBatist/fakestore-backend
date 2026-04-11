import crypto from "crypto";
import { Knex } from "../../database/knex";
import { TenantProvider } from "../../database/providers/tenants";
import { UserProvider } from "../../database/providers/user";
import { passwordCrypto } from "../../shared/services";
import { ConflictError } from "../../errors";
import { PLAN_CONFIG, TRIAL_DURATION_DAYS } from "../../shared/constants";
import type { ITenant, IUser } from "../../database/models";
import { logger } from "../../shared/services/Logger";

interface RegisterInput {
  name: string;
  slug: string;
  owner_name: string;
  owner_email: string;
  owner_password: string;
}

interface RegisterOutput {
  tenant: Pick<ITenant, "id_tenant" | "name" | "slug" | "plan" | "rate_limit">;
  api_key: string;
  api_secret: string;
}

export const register = async (
  data: RegisterInput,
): Promise<RegisterOutput> => {
  const existing = await TenantProvider.getBySlug(data.slug);
  if (existing) {
    throw new ConflictError("errors:slug_already_taken");
  }

  const apiKey = crypto.randomBytes(32).toString("hex");
  const apiSecret = crypto.randomBytes(32).toString("hex");

  const apiKeyHash = crypto.createHash("sha256").update(apiKey).digest("hex");
  const apiSecretHash = await passwordCrypto.hashPassword(apiSecret);
  const ownerPasswordHash = await passwordCrypto.hashPassword(
    data.owner_password,
  );

  const trx = await Knex.transaction();

  try {
    // New tenants get a 14-day trial on the basic plan
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DURATION_DAYS);

    const tenant = await TenantProvider.create(
      {
        name: data.name,
        slug: data.slug,
        api_key_hash: apiKeyHash,
        api_secret_hash: apiSecretHash,
        plan: "basic",
        rate_limit: PLAN_CONFIG.basic.rate_limit,
      },
      trx,
    );

    // Set trial_ends_at after creation (not part of Create provider's typed input)
    await trx("tenants")
      .where("id_tenant", tenant.id_tenant)
      .update({ trial_ends_at: trialEndsAt });

    // Set RLS context for user creation
    await trx.raw(`SET LOCAL app.current_tenant_id = '${tenant.id_tenant}'`);

    await UserProvider.create(
      {
        name: data.owner_name,
        email: data.owner_email,
        password_hash: ownerPasswordHash,
        role: "admin",
      } as Omit<IUser, "id_user">,
      trx,
    );

    await trx.commit();

    logger.info(
      { slug: data.slug, plan: "basic", trialEndsAt: trialEndsAt.toISOString() },
      "Tenant registered",
    );

    return {
      tenant: {
        id_tenant: tenant.id_tenant,
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.plan,
        rate_limit: tenant.rate_limit,
      },
      api_key: apiKey,
      api_secret: apiSecret,
    };
  } catch (error: unknown) {
    await trx.rollback();

    // Handle unique constraint violation (race condition on slug)
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "23505"
    ) {
      throw new ConflictError("errors:slug_already_taken");
    }

    throw error;
  }
};
