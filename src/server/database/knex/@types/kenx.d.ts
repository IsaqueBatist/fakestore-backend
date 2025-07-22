import { ICart, ICart_Item, ICategory, IPerson, IProduct, IUser } from '../../models'
import { IAddress } from '../../models/Addresses'
import { IOrder } from '../../models/Order'
import { IProduct_Category } from '../../models/Product_category'
import { IProduct_Detail } from '../../models/Product_detail'

declare module 'knex/types/tables' {
  interface Tables {
    product: IProduct
    person: IPerson
    user: IUser
    categories: ICategory
    orders: IOrder
    carts: ICart
    cart_items: ICart_Item
    addresses: IAddress
    product_details: IProduct_Detail
    product_categories: IProduct_Category
  }
}