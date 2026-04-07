import crypto from "crypto";
import { TenantProvider } from "../../database/providers/tenants";
import { passwordCrypto } from "../../shared/services";
import { RedisService } from "../../shared/services/RedisService";
import { Knex } from "../../database/knex";
import { EtableNames } from "../../database/ETableNames";

interface RotateKeysInput {
  tenantId: number;
  currentApiKey?: string;
}

interface RotateKeysOutput {
  api_key: string;
  api_secret: string;
}

export const rotateKeys = async (
  data: RotateKeysInput,
): Promise<RotateKeysOutput> => {
  const newApiKey = crypto.randomBytes(32).toString("hex");
  const newApiSecret = crypto.randomBytes(32).toString("hex");

  const newApiKeyHash = crypto
    .createHash("sha256")
    .update(newApiKey)
    .digest("hex");
  const newApiSecretHash = await passwordCrypto.hashPassword(newApiSecret);

  // Get old api_key_hash for cache invalidation before updating
  let oldApiKeyHash: string;
  if (data.currentApiKey) {
    oldApiKeyHash = crypto
      .createHash("sha256")
      .update(data.currentApiKey)
      .digest("hex");
  } else {
    // JWT-based rotation: fetch current hash from DB
    const tenant = await Knex(EtableNames.tenants)
      .where("id_tenant", data.tenantId)
      .select("api_key_hash")
      .first();
    oldApiKeyHash = tenant!.api_key_hash;
  }

  await TenantProvider.updateKeys(
    data.tenantId,
    newApiKeyHash,
    newApiSecretHash,
  );

  await RedisService.invalidate(`tenant:hash:${oldApiKeyHash}`);

  console.log(`[TENANT_KEYS_ROTATED] tenant_id=${data.tenantId}`);

  return {
    api_key: newApiKey,
    api_secret: newApiSecret,
  };
};
