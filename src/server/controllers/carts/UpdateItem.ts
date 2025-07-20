import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from 'yup';
import { validation } from "../../shared/middlewares/Validation";
import { JWTService } from "../../shared/services";
import { ICart_Item } from "../../database/models/Cart_Item";
import { CartProvider } from "../../database/providers/carts";

interface IBodyProps extends Omit<ICart_Item, 'id_cart_item' | 'added_at' | 'cart_id' | 'product_id'> {}
interface IParamsProps {
  id?: number; // aqui representa o product_id que será usado para localizar o item no carrinho
}

export const updateByIdValidation = validation(getSchema => ({
  params: getSchema<IParamsProps>(yup.object().shape({
    id: yup.number().required().moreThan(0)
  })),
  body: getSchema<IBodyProps>(yup.object().shape({
    quantity: yup.number().required()
  }))
}));

export const updateById = async (req: Request<IParamsProps, {}, IBodyProps>, res: Response) => {
  if (!req.params.id) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      errors: {
        default: 'The product ID must be provided in the URL.'
      }
    });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      errors: { default: 'User must be logged in' }
    });
  }

  const [_, token] = authHeader.split(' ');
  const userId = JWTService.verify(token);

  if (userId === 'JWT_SECRET_NOT_FOUND') {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errors: { default: 'JWT secret not found on server' }
    });
  } else if (userId === 'INVALID_TOKEN') {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      errors: { default: 'Invalid token' }
    });
  }

  const result = await CartProvider.updateItem(req.body, userId.uid, req.params.id);

  if (result instanceof Error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errors: { default: result.message }
    });
  }

  return res.status(StatusCodes.NO_CONTENT).send();
};
