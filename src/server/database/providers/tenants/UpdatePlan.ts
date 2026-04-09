import { EtableNames } from "../../ETableNames";
import { DatabaseError } from "../../../errors";
import { Knex as KnexInstance } from "../../knex";

export const updatePlan = async (
  tenantId: number,
  plan: string,
  rateLimit: number,
  planExpiresAt: Date | null,
): Promise<void> => {
  try {
    await KnexInstance(EtableNames.tenants)
      .where("id_tenant", tenantId)
      .update({
        plan,
        rate_limit: rateLimit,
        plan_expires_at: planExpiresAt,
        updated_at: KnexInstance.fn.now(),
      });
  } catch (error) {
    console.error(error);
    throw new DatabaseError("errors:db_error_updating", { resource: "tenant plan" });
  }
};
