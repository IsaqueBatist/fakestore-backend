import * as addItem from "./AddItem";
import * as cleanCart from "./CleanCart";
import * as deleteItem from "./DeleteItem";
import * as getByUserId from "./GetByUserId";
import * as getItems from "./GetItems";
import * as updateItem from "./UpdateItem";

export const CartService = {
  ...addItem,
  ...cleanCart,
  ...deleteItem,
  ...getByUserId,
  ...getItems,
  ...updateItem,
};
