import {ICategory, IPerson, IProduct, IUser} from '../../models'

declare module 'knex/types/tables' {
  interface Tables {
    products: IProduct
    person: IPerson
    user: IUser
    categories: ICategory
  }
}