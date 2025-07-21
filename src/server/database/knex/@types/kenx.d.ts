import { ICart, ICart_Item, ICategory, IPerson, IProduct, IUser } from '../../models'
import { IAddress } from '../../models/Addresses'
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
    addresses: IAddress
  }
}