import { ICart, ICart_Item, ICategory, IPerson, IProduct, IUser, IAddress, IOrder, IProduct_Category, IProduct_Comment, IProduct_Detail, IUser_Favorite, IOrder_Item } from '../../models'

declare module 'knex/types/tables' {
  interface Tables {
    product: IProduct
    person: IPerson
    user: IUser
    categories: ICategory
    orders: IOrder
    cart: ICart
    cart_items: ICart_Item
    addresses: IAddress
    product_details: IProduct_Detail
    product_categories: IProduct_Category
    user_favorites: IUser_Favorite
    product_comments: IProduct_Comment
    order_items: IOrder_Item
  }
}