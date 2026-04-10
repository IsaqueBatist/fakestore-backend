import { getBillingProvider } from "../../shared/services/billing";
import { TenantProvider } from "../../database/providers/tenants";
import { BadRequestError } from "../../errors";

export const createPortalSession = async (
  tenantId: number,
  returnUrl: string,
): Promise<{ url: string }> => {
  const provider = getBillingProvider();

  const tenant = await TenantProvider.getBySubscriptionId(
    "", // We need to find by tenant ID instead
  ).catch(() => null);

  // Fetch tenant directly by ID using Knex
  const { Knex } = await import("../../database/knex");
  const { EtableNames } = await import("../../database/ETableNames");

  const tenantRecord = await Knex(EtableNames.tenants)
    .where("id_tenant", tenantId)
    .select("stripe_customer_id")
    .first();

  if (!tenantRecord?.stripe_customer_id) {
    throw new BadRequestError("errors:no_stripe_customer", {
      message:
        "No Stripe customer associated. Please subscribe to a plan first.",
    });
  }

  return provider.createPortalSession(
    tenantRecord.stripe_customer_id,
    returnUrl,
  );
};
