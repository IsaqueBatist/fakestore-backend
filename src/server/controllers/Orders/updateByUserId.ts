import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from 'yup';
import { validation } from "../../shared/middlewares/Validation";
import { IOrder } from "../../database/models/Order";
import { JWTService } from "../../shared/services";
import { OrderProvider } from "../../database/providers/orders";

interface IBodyProps extends Omit<IOrder, 'id_order' | 'created_at' | 'user_id'> {}
interface IParamsProps {
  id?: number
}

export const updateByUserIdValidation = validation(getSchema => ({
  params: getSchema<IParamsProps>(yup.object().shape({
    id: yup.number().optional().moreThan(0)
  })),
  body: getSchema<IBodyProps>(yup.object().shape({
    total: yup.number().required().moreThan(0),
    status: yup.string().required()
  }))
}))

export const updateById = async (req: Request<IParamsProps>, res: Response) => {
  if (!req.headers.authorization){
    return res.status(StatusCodes.UNAUTHORIZED).json({
      errors: {
        default: 'User should be logged in'
      }
    })
  }

    const [type, token] = req.headers.authorization.split(' ')

  const userId = JWTService.verify(token)

  if (userId === 'JWT_SECRET_NOT_FOUND') {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      errors: {default: 'JWT secret not found on server'}
    })
  } else if (userId === 'INVALID_TOKEN') {
    return res.status(StatusCodes.UNAUTHORIZED).send({
      errors: {default: 'Internal authentication error'}
    })
  }

  const userOrders = await OrderProvider.getByUserId(userId.uid)

  if(userOrders instanceof Error){
    if(userOrders.message === 'Order not found') return res.status(StatusCodes.NOT_FOUND).json({errors: {default: userOrders.message}})
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({errors: {default: userOrders.message}})
  }

  const order = userOrders.find(order => Number(order.id_order) === Number(req.params.id));

  if (!order) {
    return res.status(StatusCodes.FORBIDDEN).json({
      errors: { default: 'You are not allowed to update this order' }
    });
  }

  const result = await OrderProvider.updateByUserId(order.id_order, req.body);
  
  if (result instanceof Error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errors: {
        default: result.message
      }
    });
  }

  return res.status(StatusCodes.NO_CONTENT).send();
}