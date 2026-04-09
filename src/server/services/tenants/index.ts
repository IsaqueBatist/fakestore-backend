import * as register from "./Register";
import * as rotateKeys from "./RotateKeys";
import * as handleBillingWebhook from "./HandleBillingWebhook";
import * as downgradeTenantToSandbox from "./DowngradeToSandbox";

export const TenantService = {
  ...register,
  ...rotateKeys,
  ...handleBillingWebhook,
  ...downgradeTenantToSandbox,
};
