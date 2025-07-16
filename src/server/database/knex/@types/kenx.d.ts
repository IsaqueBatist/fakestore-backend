import { IProduct } from "../../models"
import { IPerson } from "../../models/Person"

declare module 'knex/types/tables' {
  interface Tables {
    products: IProduct
    person: IPerson
  }
}