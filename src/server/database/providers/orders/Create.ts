import { EtableNames } from "../../ETableNames";
import { Knex } from "../../knex";
import { IOrder_Item } from "../../models";
import {
  AppError,
  NotFoundError,
  TransactionError,
  DatabaseError,
} from "../../../errors";

export const create = async (userId: number): Promise<number | Error> => {
  try {
    return await Knex.transaction(async (trx) => {
      const userCart = await trx(EtableNames.cart)
        .select()
        .where("user_id", userId)
        .first()
        .forUpdate();

      if (!userCart) throw new NotFoundError("Cart not found");

      const [newOrder] = await trx(EtableNames.orders)
        .insert({ total: 0, user_id: userId })
        .returning("id_order");

      const cartItems = await trx(EtableNames.cart_items)
        .select()
        .where("cart_id", userCart.id_cart);

      const productsId: number[] = cartItems.map((cItem) =>
        Number(cItem.product_id),
      );

      const products = await trx(EtableNames.products)
        .select("id_product", "price")
        .whereIn("id_product", productsId);

      if (products.length !== cartItems.length) {
        throw new NotFoundError("Some products were not found");
      }

      const priceMap = new Map(products.map((p) => [p.id_product, p.price]));

      const orderItems: Omit<IOrder_Item, "id_order_item">[] = cartItems.map(
        (cartItem) => ({
          order_id: newOrder.id_order,
          product_id: cartItem.product_id,
          quantity: cartItem.quantity,
          unt_price: priceMap.get(cartItem.product_id) ?? 0,
        }),
      );

      const addOrderItems = await trx(EtableNames.order_items).insert(
        orderItems,
      );

      if (!addOrderItems)
        throw new TransactionError("Error while add items from cart to order");

      //Calcular total

      const newTotal = orderItems.reduce(
        (acc, item) => acc + item.quantity * item.unt_price,
        0,
      );

      const updatedTotal = await trx(EtableNames.orders)
        .update({ total: newTotal })
        .where("id_order", newOrder.id_order);

      if (!updatedTotal)
        throw new TransactionError("Unable to recalculate total");

      //Limpar carrinho
      await trx(EtableNames.cart_items)
        .where("cart_id", userCart.id_cart)
        .del();

      return newOrder.id_order;
    });
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) throw error;
    throw new DatabaseError("Database error while creating order");
  }
};
