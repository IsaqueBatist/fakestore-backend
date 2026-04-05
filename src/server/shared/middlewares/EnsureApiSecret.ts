import { RequestHandler } from "express";
import { UnauthorizedError } from "../../errors";
import { passwordCrypto } from "../services/PasswordCrypto";
import { Knex as KnexInstance } from "../../database/knex";
import { EtableNames } from "../../database/ETableNames";

/**
 * Middleware for server-to-server authentication.
 * Requires both x-api-key (already resolved by EnsureTenant) and x-api-secret.
 * Validates the secret against the bcrypt hash stored in the tenant record.
 *
 * Use this middleware AFTER EnsureTenant for admin/S2S operations like
 * bulk imports, webhook configuration, and tenant management.
 */
export const ensureApiSecret: RequestHandler = async (req, _res, next) => {
  if (!req.tenant) {
    throw new UnauthorizedError("errors:missing_api_key");
  }

  const apiSecret = req.headers["x-api-secret"] as string | undefined;

  if (!apiSecret) {
    throw new UnauthorizedError("errors:missing_api_secret");
  }

  // Fetch the tenant record to get the secret hash
  const tenant = await KnexInstance(EtableNames.tenants)
    .where("id_tenant", req.tenant.id)
    .where("is_active", true)
    .first();

  if (!tenant) {
    throw new UnauthorizedError("errors:invalid_api_key");
  }

  // Verify the secret against the stored bcrypt hash
  const isValid = await passwordCrypto.verifyPassword(
    apiSecret,
    tenant.api_secret_hash,
  );

  if (!isValid) {
    throw new UnauthorizedError("errors:invalid_api_secret");
  }

  return next();
};
