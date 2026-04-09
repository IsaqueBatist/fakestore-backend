import { UserProvider } from "../../database/providers/user";
import { ProductProvider } from "../../database/providers/products";
import { ConflictError } from "../../errors";
import type { Knex } from "knex";

export const addFavorite = async (
  trx: Knex.Transaction,
  productId: number,
  userId: number,
): Promise<number> => {
  const alreadyFavorite = await UserProvider.getFavorite(
    productId,
    userId,
    trx,
  );

  if (alreadyFavorite)
    throw new ConflictError("errors:resource_already_exists", {
      resource: "Product",
    });

  await ProductProvider.getById(productId, trx);

  return await UserProvider.addFavorite(productId, userId, trx);
};
