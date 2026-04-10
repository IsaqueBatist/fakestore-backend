import * as register from "./Register";
import * as rotateKeys from "./RotateKeys";
import * as rotateCredentials from "./RotateCredentials";
import * as billingWebhook from "./BillingWebhook";
import * as billing from "./Billing";

export const TenantController = {
  ...register,
  ...rotateKeys,
  ...rotateCredentials,
  ...billingWebhook,
  ...billing,
};
