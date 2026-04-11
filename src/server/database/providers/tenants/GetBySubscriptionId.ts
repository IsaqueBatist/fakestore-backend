import { EtableNames } from "../../ETableNames";
import { ITenant } from "../../models";
import { DatabaseError } from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import { Knex as KnexInstance } from "../../knex";

export const getBySubscriptionId = async (
  subscriptionId: string,
): Promise<ITenant | undefined> => {
  try {
    const tenant = await KnexInstance(EtableNames.tenants)
      .where("subscription_id", subscriptionId)
      .first();

    return tenant as ITenant | undefined;
  } catch (error) {
    logger.error({ err: error }, "Failed to get tenant by subscription id");
    throw new DatabaseError("errors:db_error_getting", { resource: "tenant" });
  }
};
