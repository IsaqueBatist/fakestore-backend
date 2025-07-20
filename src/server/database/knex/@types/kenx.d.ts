import {ICategory, IPerson, IProduct, IUser, ICart, ICart_Item} from '../../models'
import { IOrder } from '../../models/Order'

declare module 'knex/types/tables' {
  interface Tables {
    products: IProduct
    person: IPerson
    user: IUser
    categories: ICategory
    orders: IOrder
    carts: ICart
    cart_items: ICart_Item
  }
}