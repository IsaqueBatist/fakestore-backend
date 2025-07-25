import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from 'yup';
import { validation } from "../../shared/middlewares/Validation";
import { JWTService } from "../../shared/services";
import { CartProvider } from "../../database/providers/carts";
import { IOrder_Item } from "../../database/models";
import { OrderProvider } from "../../database/providers/orders";

interface IBodyProps extends Omit<IOrder_Item, 'id_order_item' | 'order_id'> {}
interface IParamsProps {
  id?: number;
}

export const updateItemValidation = validation(getSchema => ({
  params: getSchema<IParamsProps>(yup.object().shape({
    id: yup.number().required().moreThan(0)
  })),
  body: getSchema<IBodyProps>(yup.object().shape({
    product_id: yup.number().required().moreThan(0),
    quantity: yup.number().required(),
    unt_price: yup.number().required().moreThan(0)
  }))
}));

export const updateItem = async (req: Request<IParamsProps, {}, IBodyProps>, res: Response) => {
  if (!req.params.id) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      errors: {
        default: 'The product ID must be provided in the URL.'
      }
    });
  }

  if (!req.headers.authorization) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      errors: { default: 'User must be logged in' }
    });
  }

  const [_, token] = req.headers.authorization.split(' ');

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

  const result = await OrderProvider.updateItem(req.body, userId.uid, req.params.id);

  if(result instanceof Error){
    if(result.message === 'Order not found for user'){
      return res.status(StatusCodes.NOT_FOUND).json({
        errors:{
          default: result.message
        }
      })
    } else if(result.message === 'You cant update this order'){
      return res.status(StatusCodes.FORBIDDEN).json({
        errors:{
          default: result.message
        }
      })
    } else if(result.message === 'Order item not found or unchanged'){
      return res.status(StatusCodes.FORBIDDEN).json({
        errors:{
          default: result.message
        }
      })
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errors: {
        default: result.message
      }
    })
  } 

  return res.status(StatusCodes.NO_CONTENT).send();
};
