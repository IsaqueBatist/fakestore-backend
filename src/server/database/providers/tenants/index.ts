import * as getBySlug from "./GetBySlug";
import * as create from "./Create";
import * as updateKeys from "./UpdateKeys";

export const TenantProvider = {
  ...getBySlug,
  ...create,
  ...updateKeys,
};
