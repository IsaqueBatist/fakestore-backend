import * as create from "./Create";
import * as getAll from "./GetAll";
import * as validate from "./Validate";
import * as updateById from "./UpdateById";
import * as deleteById from "./DeleteById";

export const CouponController = {
  ...create,
  ...getAll,
  ...validate,
  ...updateById,
  ...deleteById,
};
