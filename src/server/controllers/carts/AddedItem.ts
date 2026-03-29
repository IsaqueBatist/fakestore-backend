import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { CartProvider } from "../../database/providers/carts";
import { ICart_Item } from "../../database/models/Cart_Item";
import * as yup from "yup";
import { validation } from "../../shared/middlewares";
import { UnauthorizedError } from "../../errors";

interface IBodyProps extends Omit<
  ICart_Item,
  "id_cart_item" | "added_at" | "cart_id"
> {}

export const addedItemValidation = validation((getSchema) => ({
  body: getSchema<IBodyProps>(
    yup.object().shape({
      product_id: yup.number().required().moreThan(0),
      quantity: yup.number().required().moreThan(0),
    }),
  ),
}));

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const additem = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("User should be logged in");
  }

  const result = await CartProvider.addItem(req.body, userId);

  return res.status(StatusCodes.CREATED).json(result);
};
