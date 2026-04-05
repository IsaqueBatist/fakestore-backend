import * as addedItem from "./AddedItem";
import * as cleanCart from "./CleanCart";
import * as createCart from "./CreateCart";
import * as deleteItem from "./DeleteItem";
import * as getByUserId from "./GetByUserId";
import * as getItem from "./GetItem";
import * as getItems from "./GetItems";
import * as updateItem from "./UpdateItem";
import * as updateItemQuantity from "./UpdateItemQuantity";

export const CartProvider = {
  ...addedItem,
  ...cleanCart,
  ...createCart,
  ...deleteItem,
  ...getByUserId,
  ...getItem,
  ...getItems,
  ...updateItem,
  ...updateItemQuantity,
};
