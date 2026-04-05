import * as create from "./Create";
import * as deleteById from "./DeleteById";
import * as getByUserId from "./GetByUserId";
import * as getById from "./GetById";
import * as updateById from "./UpdateById";

import * as addItem from "./AddItem";
import * as addItems from "./AddItems";
import * as deleteItem from "./DeleteItem";
import * as getItem from "./GetItem";
import * as getItems from "./GetItems";
import * as getOrderItems from "./GetOrderItems";
import * as updateItem from "./UpdateItem";
import * as updateItemQuantity from "./UpdateItemQuantity";
import * as updateStatus from "./UpdateStatus";
import * as updateTotal from "./UpdateTotal";

export const OrderProvider = {
  ...create,
  ...deleteById,
  ...getByUserId,
  ...updateById,
  ...addItem,
  ...addItems,
  ...deleteItem,
  ...getItem,
  ...getItems,
  ...getOrderItems,
  ...updateItem,
  ...updateItemQuantity,
  ...updateStatus,
  ...updateTotal,
  ...getById,
};
