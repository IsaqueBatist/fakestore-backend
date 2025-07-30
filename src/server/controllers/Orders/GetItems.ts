import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { OrderProvider } from '../../database/providers/orders';
import { validation } from '../../shared/middlewares';
import * as yup from 'yup'
interface IParamProps {
  order_id?: number
}

export const getByIdValidation = validation( (getSchema) => ({
  params: getSchema<IParamProps>(yup.object().shape({
    order_id: yup.number().optional().moreThan(0)
  }))
}));

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const getItem = async (req: Request<IParamProps>, res: Response) => {
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

  const result = await OrderProvider.getItems(userId, req.params.order_id)
  
  if(result instanceof Error){
    if(result.message === 'User dont have an order'){
      return res.status(StatusCodes.NOT_FOUND).json({
        errors:{
          default: result.message
        }
      })
    } else if(result.message === 'Items not found'){
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

  return res.status(StatusCodes.OK).json(result)
};
