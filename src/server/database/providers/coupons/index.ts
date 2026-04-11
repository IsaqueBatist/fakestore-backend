import * as create from "./Create";
import * as deleteById from "./DeleteById";
import * as getAll from "./GetAll";
import * as getByCode from "./GetByCode";
import * as incrementUses from "./IncrementUses";
import * as updateById from "./UpdateById";

export const CouponProvider = {
  ...create,
  ...deleteById,
  ...getAll,
  ...getByCode,
  ...incrementUses,
  ...updateById,
};
