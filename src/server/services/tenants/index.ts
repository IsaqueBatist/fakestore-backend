import * as register from "./Register";
import * as rotateKeys from "./RotateKeys";
import * as handleBillingWebhook from "./HandleBillingWebhook";
import * as downgradeTenantToSandbox from "./DowngradeToSandbox";
import * as createCheckoutSession from "./CreateCheckoutSession";
import * as createPortalSession from "./CreatePortalSession";
import * as verifyCheckoutSession from "./VerifyCheckoutSession";

export const TenantService = {
  ...register,
  ...rotateKeys,
  ...handleBillingWebhook,
  ...downgradeTenantToSandbox,
  ...createCheckoutSession,
  ...createPortalSession,
  ...verifyCheckoutSession,
};
