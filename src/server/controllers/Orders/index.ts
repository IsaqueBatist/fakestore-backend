import * as create from './Create';
import * as deleteById from './DeleteById';
import * as getById from './GetByUserId';
import * as updateByUserId from './updateByUserId';

import * as addItem from './AddItem'
import * as deleteItem from './DeleteItem'
import * as updateItem from './UpdateItem'
import * as getItem from './GetItems'

export const OrderController = {
  ...create,
  ...getById,
  ...updateByUserId,
  ...deleteById,
  ...addItem,
  ...deleteItem,
  ...updateItem,
  ...getItem
};