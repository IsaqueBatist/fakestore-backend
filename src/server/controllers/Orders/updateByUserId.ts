import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from 'yup';
import { validation } from "../../shared/middlewares/Validation";
import { IOrder } from "../../database/models/Order";
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
  const userId = req.user?.id
  
  if (!userId){
    return res.status(StatusCodes.UNAUTHORIZED).json({
      errors: {
        default: 'User should be logged in'
      }
    })
  }
  

  const userOrders = await OrderProvider.getByUserId(userId)

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