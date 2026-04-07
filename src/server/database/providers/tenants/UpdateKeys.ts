import { EtableNames } from "../../ETableNames";
import { DatabaseError } from "../../../errors";
import { Knex } from "../../knex";

export const updateKeys = async (
  tenantId: number,
  apiKeyHash: string,
  apiSecretHash: string,
): Promise<void> => {
  try {
    await Knex(EtableNames.tenants).where("id_tenant", tenantId).update({
      api_key_hash: apiKeyHash,
      api_secret_hash: apiSecretHash,
      updated_at: Knex.fn.now(),
    });
  } catch (error) {
    console.error(error);
    throw new DatabaseError("errors:db_error_updating");
  }
};
