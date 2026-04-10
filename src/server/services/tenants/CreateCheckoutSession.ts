import { getBillingProvider } from "../../shared/services/billing";
import { TenantProvider } from "../../database/providers/tenants";
import { NotFoundError, BadRequestError } from "../../errors";

export const createCheckoutSession = async (
  tenantId: number,
  plan: string,
  billingEmail: string,
): Promise<{ url: string }> => {
  const provider = getBillingProvider();

  if (!["basic", "agency"].includes(plan)) {
    throw new BadRequestError("errors:invalid_plan", { plan });
  }

  const result = await provider.createSubscription(
    tenantId,
    plan,
    billingEmail,
  );

  // Store subscription_id immediately so webhook can find the tenant
  if (result.subscription_id) {
    await TenantProvider.updatePlan(
      tenantId,
      plan,
      0, // Rate limit will be updated by webhook confirmation
      null,
    );
  }

  return { url: result.url };
};
