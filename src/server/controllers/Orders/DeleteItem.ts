import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup'
import { validation } from '../../shared/middlewares';
import { OrderProvider } from '../../database/providers/orders';

interface IParamProps {
  id?: number
}

export const deleteItemValidation = validation( (getSchema) => ({
  params: getSchema<IParamProps>(yup.object().shape({
    id: yup.number().optional().moreThan(0)
  }))
}));

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const deleteItem = async (req: Request<IParamProps>, res: Response) => {
  if(!req.params.id){
    return res.status(StatusCodes.BAD_REQUEST).json({
      errors: {
        default: 'The id parameter needs to be entered'
      }
    })
  }
  
  const userId = req.user?.id
  
  if (!userId){
    return res.status(StatusCodes.UNAUTHORIZED).json({
      errors: {
        default: 'User should be logged in'
      }
    })
  }
  

  const result = await OrderProvider.deleteItem(userId, req.params.id)

  if(result instanceof Error){
    if(result.message === 'Order not found for user'){
      return res.status(StatusCodes.NOT_FOUND).json({
        errors:{
          default: result.message
        }
      })
    } else if(result.message === 'You cant delete this item of order'){
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

  return res.status(StatusCodes.NO_CONTENT).send()
};
