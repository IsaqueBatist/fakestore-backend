import { EtableNames } from "../../ETableNames";
import { DatabaseError } from "../../../errors";
import { logger } from "../../../shared/services/Logger";
import { Knex as KnexInstance } from "../../knex";

export const updateStripeCustomerId = async (
  tenantId: number,
  stripeCustomerId: string,
): Promise<void> => {
  try {
    await KnexInstance(EtableNames.tenants)
      .where("id_tenant", tenantId)
      .update({
        stripe_customer_id: stripeCustomerId,
        updated_at: KnexInstance.fn.now(),
      });
  } catch (error) {
    logger.error({ err: error }, "Failed to update tenant Stripe customer id");
    throw new DatabaseError("errors:db_error_updating", {
      resource: "tenant stripe_customer_id",
    });
  }
};
