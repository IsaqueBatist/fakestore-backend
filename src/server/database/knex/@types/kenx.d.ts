import {ICategory, IPerson, IProduct, IUser} from '../../models'
import { IOrder } from '../../models/Order'

declare module 'knex/types/tables' {
  interface Tables {
    products: IProduct
    person: IPerson
    user: IUser
    categories: ICategory
    orders: IOrder
  }
}