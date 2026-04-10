import { EtableNames } from "../../ETableNames";
import { DatabaseError } from "../../../errors";
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
    console.error(error);
    throw new DatabaseError("errors:db_error_updating", {
      resource: "tenant stripe_customer_id",
    });
  }
};
