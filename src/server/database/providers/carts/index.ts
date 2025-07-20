import * as addedItem from './AddedItem'
import * as cleanCart from './CleanCart'
import * as createCart from './CreateCart'
import * as deleteItem from './DeleteItem'
import * as getByUserId from './GetByUserId'
import * as updateItem from './updateItem'

export const CartProvider = {
  ...addedItem,
  ...cleanCart,
  ...createCart,
  ...deleteItem,
  ...getByUserId,
  ...updateItem
};