import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { CartProvider } from "../../database/providers/carts";
import * as yup from "yup";
import { validation } from "../../shared/middlewares";
import { BadRequestError, UnauthorizedError } from "../../errors";

interface IParamProps {
  id?: number;
}

export const deleteItemValidation = validation((getSchema) => ({
  params: getSchema<IParamProps>(
    yup.object().shape({
      id: yup.number().optional().moreThan(0),
    }),
  ),
}));

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const deleteItem = async (req: Request<IParamProps>, res: Response) => {
  if (!req.params.id) {
    throw new BadRequestError("The id parameter needs to be entered");
  }

  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("User should be logged in");
  }
  await CartProvider.deleteItem(userId, req.params.id);

  return res.status(StatusCodes.NO_CONTENT).send();
};
