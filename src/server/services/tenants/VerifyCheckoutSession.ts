import { getBillingProvider } from "../../shared/services/billing";
import { TenantProvider } from "../../database/providers/tenants";
import { RedisService } from "../../shared/services/RedisService";
import { PLAN_CONFIG } from "../../shared/constants";
import { BadRequestError } from "../../errors";

/**
 * Polling contingency: verify a Stripe Checkout Session after redirect.
 * Ensures stripe_customer_id and subscription are saved even if webhook is delayed.
 */
export const verifyCheckoutSession = async (
  tenantId: number,
  sessionId: string,
): Promise<{ status: string; plan: string }> => {
  const provider = getBillingProvider();

  const session = await provider.retrieveCheckoutSession(sessionId);

  if (session.status !== "complete") {
    throw new BadRequestError("errors:checkout_not_complete", {
      status: session.status,
    });
  }

  // Persist customer ID if not yet saved by webhook
  if (session.customer_id) {
    await TenantProvider.updateStripeCustomerId(
      tenantId,
      session.customer_id,
    );
  }

  // Update plan if not yet updated by webhook
  const planConfig = PLAN_CONFIG[session.plan] || PLAN_CONFIG.sandbox;
  await TenantProvider.updatePlan(
    tenantId,
    session.plan,
    planConfig.rate_limit,
    null,
  );

  // Invalidate tenant cache
  await RedisService.invalidate(`tenant:id:${tenantId}`);

  return { status: session.status, plan: session.plan };
};
