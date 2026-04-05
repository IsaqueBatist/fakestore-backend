import { UserProvider } from "../../database/providers/user";
import { ProductProvider } from "../../database/providers/products";
import { ConflictError } from "../../errors";

export const addFavorite = async (
  productId: number,
  userId: number,
): Promise<number> => {
  const alreadyFavorite = await UserProvider.getFavorite(productId, userId);

  if (alreadyFavorite)
    throw new ConflictError("errors:resource_already_exists", { resource: "Product" });

  await ProductProvider.getById(productId);

  return await UserProvider.addFavorite(productId, userId);
};
