import { TenantProvider } from "../../database/providers/tenants";
import { RedisService } from "../../shared/services/RedisService";
import { NotFoundError } from "../../errors";
import { PLAN_CONFIG, DEFAULT_GRACE_PERIOD_DAYS } from "../../shared/constants";
import { downgradeTenantToSandbox } from "./DowngradeToSandbox";
import type { BillingWebhookPayload } from "../../shared/services/billing";

export const handleBillingWebhook = async (
  payload: BillingWebhookPayload,
): Promise<void> => {
  const { event, subscription_id, plan, customer_email, customer_id } =
    payload;

  const tenant = await TenantProvider.getBySubscriptionId(subscription_id);

  if (!tenant) {
    throw new NotFoundError("errors:tenant_not_found_for_subscription", {
      subscription_id,
    });
  }

  const tenantId = tenant.id_tenant;

  switch (event) {
    case "subscription.activated": {
      const planConfig = PLAN_CONFIG[plan] || PLAN_CONFIG.sandbox;
      await TenantProvider.updatePlan(
        tenantId,
        plan,
        planConfig.rate_limit,
        null,
      );
      // Persist Stripe customer ID for portal session access
      if (customer_id) {
        await TenantProvider.updateStripeCustomerId(tenantId, customer_id);
      }
      break;
    }

    case "subscription.updated": {
      const planConfig = PLAN_CONFIG[plan] || PLAN_CONFIG.sandbox;
      await TenantProvider.updatePlan(
        tenantId,
        plan,
        planConfig.rate_limit,
        null,
      );
      break;
    }

    case "subscription.cancelled": {
      // Start grace period instead of immediate downgrade
      const graceEnd = new Date();
      graceEnd.setDate(
        graceEnd.getDate() +
          (tenant.grace_period_days || DEFAULT_GRACE_PERIOD_DAYS),
      );
      await TenantProvider.updatePlan(
        tenantId,
        tenant.plan,
        tenant.rate_limit,
        graceEnd,
      );
      break;
    }

    case "payment.failed": {
      // Start grace period on payment failure
      const graceEnd = new Date();
      graceEnd.setDate(
        graceEnd.getDate() +
          (tenant.grace_period_days || DEFAULT_GRACE_PERIOD_DAYS),
      );
      await TenantProvider.updatePlan(
        tenantId,
        tenant.plan,
        tenant.rate_limit,
        graceEnd,
      );
      console.log(
        `[BILLING] Payment failed for tenant ${tenantId} (${customer_email}), grace period started`,
      );
      break;
    }

    default:
      console.log(
        `[BILLING] Unhandled billing event: ${event} for tenant ${tenantId}`,
      );
      return;
  }

  // Invalidate tenant cache after any plan change
  await RedisService.invalidate(`tenant:id:${tenantId}`);
};
