import * as create from './Create';
import * as deleteById from './DeleteById';
import * as getByUserId from './GetByUserId';
import * as updateById from './updateById';

export const OrderProvider = {
  ...create,
  ...deleteById,
  ...getByUserId,
  ...updateById
};