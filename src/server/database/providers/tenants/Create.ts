import { EtableNames } from "../../ETableNames";
import { ITenant } from "../../models";
import { DatabaseError } from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import type { Knex as KnexType } from "knex";

type CreateTenantData = Pick<
  ITenant,
  "name" | "slug" | "api_key_hash" | "api_secret_hash" | "plan" | "rate_limit"
>;

export const create = async (
  data: CreateTenantData,
  trx: KnexType.Transaction,
): Promise<ITenant> => {
  try {
    const [tenant] = await trx(EtableNames.tenants)
      .insert({ ...data, is_active: true })
      .returning("*");

    return tenant as ITenant;
  } catch (error) {
    logger.error({ err: error }, "Failed to create tenant");
    throw new DatabaseError("errors:db_error_registering");
  }
};
