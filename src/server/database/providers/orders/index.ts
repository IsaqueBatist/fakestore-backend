import * as create from './Create';
import * as deleteById from './DeleteById';
import * as getByUserId from './GetByUserId';
import * as getById from './GetById'
import * as updateById from './UpdateById';

import * as addItem from './AddItem'
import * as deleteItem from './DeleteItem'
import * as updateItem from './UpdateItem'
import * as getItems from './GetiItems'

export const OrderProvider = {
  ...create,
  ...deleteById,
  ...getByUserId,
  ...updateById,
  ...addItem,
  ...deleteItem,
  ...updateItem,
  ...getItems,
  ...getById
};