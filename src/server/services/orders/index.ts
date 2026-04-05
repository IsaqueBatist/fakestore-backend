import * as confirmPayment from "./ConfirmPayment";
import * as create from "./Create";
import * as addItem from "./AddItem";
import * as deleteById from "./DeleteById";
import * as deleteItem from "./DeleteItem";
import * as getById from "./GetById";
import * as getByUserId from "./GetByUserId";
import * as getItems from "./GetItems";
import * as updateById from "./UpdateById";
import * as updateItem from "./UpdateItem";

export const OrderService = {
  ...confirmPayment,
  ...create,
  ...addItem,
  ...deleteById,
  ...deleteItem,
  ...getById,
  ...getByUserId,
  ...getItems,
  ...updateById,
  ...updateItem,
};
