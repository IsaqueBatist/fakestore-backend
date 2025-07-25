import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { ICart_Item } from "../../models";

export const getItems = async (userId: number): Promise<ICart_Item[] | Error> => {
  try {

    const result = await Knex(EtableNames.cart).select().where('user_id', userId).first()

    if(!result) return new Error('User dont have a cart')

    const items = await Knex(EtableNames.cart_items).select().where('cart_id', result.id_cart)

    if(items) return items

    return new Error(`Items not found`)
  } catch (error) {
    console.error(error)
    return new Error(`Database error while getting order items`);
  }
}