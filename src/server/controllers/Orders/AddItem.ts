import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup'
import { validation } from '../../shared/middlewares';
import { IOrder_Item } from '../../database/models';
import { OrderProvider } from '../../database/providers/orders';

interface IBodyProps extends  Omit<IOrder_Item, 'id_order_item' | 'order_id'> {}
interface IParamProps {
  order_id?: number
}

export const addedItemValidation = validation( (getSchema) => ({
  body: getSchema<IBodyProps>(yup.object().shape({
    product_id: yup.number().required().moreThan(0),
    quantity: yup.number().required(),
    unt_price: yup.number().required().moreThan(0)
  })),
  params: getSchema<IParamProps>(yup.object().shape({
    order_id: yup.number().optional().moreThan(0)
  }))
}));


// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const additem = async (req: Request<IParamProps, {}, IBodyProps>, res: Response) => {
  const userId = req.user?.id
  
  if (!userId){
    return res.status(StatusCodes.UNAUTHORIZED).json({
      errors: {
        default: 'User should be logged in'
      }
    })
  }
  if(!req.params.order_id){
    return res.status(StatusCodes.BAD_REQUEST).json({
      errors: {
        default: 'The order_id parameter needs to be entered'
      }
    })
  }

  const result = await OrderProvider.addItem(req.body, userId, req.params.order_id)
  
  if(result instanceof Error){
    if(result.message === 'Order not found for user'){
      return res.status(StatusCodes.NOT_FOUND).json({
        errors:{
          default: result.message
        }
      })
    } else if(result.message === 'Non-existent Product'){
      return res.status(StatusCodes.NOT_FOUND).json({
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

  return res.status(StatusCodes.CREATED).json(result)
};
