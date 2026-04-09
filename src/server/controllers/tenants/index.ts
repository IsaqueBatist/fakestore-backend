import * as register from "./Register";
import * as rotateKeys from "./RotateKeys";
import * as rotateCredentials from "./RotateCredentials";
import * as billingWebhook from "./BillingWebhook";

export const TenantController = {
  ...register,
  ...rotateKeys,
  ...rotateCredentials,
  ...billingWebhook,
};
