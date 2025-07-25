import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";

export const deleteItem = async (userId: number, productId: number): Promise<void | Error> => {
  try {
      
    const order = await Knex(EtableNames.orders)
    .select()
    .where('user_id', userId)
    .first()
    
    if (!order) {
      return new Error(`Order not found for user`);
    }

    
    if(order.user_id !== userId) return new Error('You cant delete this item of order')
    
    const deletedRows = await Knex(EtableNames.order_items)
    .where('order_id', order.id_order )
    .andWhere('product_id', productId)
    .delete()

    if(deletedRows === 0){
      return new Error(`Order item not found or unchanged`);
    }

    return
  } catch (error) {
    console.error("Error deleting order item:", error);
    return new Error(`Database error while deleting item from cart`);
  }
}