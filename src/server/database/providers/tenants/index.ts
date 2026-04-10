import * as getBySlug from "./GetBySlug";
import * as getBySubscriptionId from "./GetBySubscriptionId";
import * as create from "./Create";
import * as updateKeys from "./UpdateKeys";
import * as updatePlan from "./UpdatePlan";
import * as updateStripeCustomerId from "./UpdateStripeCustomerId";

export const TenantProvider = {
  ...getBySlug,
  ...getBySubscriptionId,
  ...create,
  ...updateKeys,
  ...updatePlan,
  ...updateStripeCustomerId,
};
