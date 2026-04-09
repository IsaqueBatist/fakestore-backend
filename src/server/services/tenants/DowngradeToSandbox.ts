import { TenantProvider } from "../../database/providers/tenants";
import { RedisService } from "../../shared/services/RedisService";
import { PLAN_CONFIG } from "../../shared/constants";

export const downgradeTenantToSandbox = async (tenantId: number): Promise<void> => {
  await TenantProvider.updatePlan(
    tenantId,
    "sandbox",
    PLAN_CONFIG.sandbox.rate_limit,
    null,
  );

  // Invalidate tenant cache so EnsureTenant picks up new limits
  await RedisService.invalidate(`tenant:id:${tenantId}`);
};
