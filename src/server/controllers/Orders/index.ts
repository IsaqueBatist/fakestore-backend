import * as create from './Create';
import * as deleteById from './DeleteById';
import * as getByUserId from './GetByUserId';
import * as updateById from './updateById';
import * as getById from './getById'

import * as addItem from './AddItem'
import * as deleteItem from './DeleteItem'
import * as updateItem from './UpdateItem'
import * as getItem from './GetItems'

export const OrderController = {
  ...create,
  ...getByUserId,
  ...updateById,
  ...deleteById,
  ...addItem,
  ...deleteItem,
  ...updateItem,
  ...getItem,
  ...getById
};