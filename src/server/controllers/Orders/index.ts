import * as create from './Create';
import * as deleteById from './DeleteById';
import * as getById from './GetByUserId';
import * as updateByUserId from './updateByUserId';

export const OrderController = {
  ...create,
  ...getById,
  ...updateByUserId,
  ...deleteById
};