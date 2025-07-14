import { IProduct } from "../../models"

declare module 'knex/types/tables' {
  interface Tables {
    products: IProduct
    // user: IUser
  }
}