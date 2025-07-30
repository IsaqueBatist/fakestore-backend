import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { OrderProvider } from "../../database/providers/orders";
import { validation } from "../../shared/middlewares";
import * as yup from 'yup'

interface IParamProps {
  id?: number
}

export const getByIdValidation = validation( (getSchema) => ({
  params: getSchema<IParamProps>(yup.object().shape({
    id: yup.number().optional().moreThan(0)
  }))
}));

export const getById = async (req: Request<IParamProps>, res: Response) => {
  const userId = req.user?.id
  
  if (!userId){
    return res.status(StatusCodes.UNAUTHORIZED).json({
      errors: {
        default: 'User should be logged in'
      }
    })
  }
  if(!req.params.id){
    return res.status(StatusCodes.BAD_REQUEST).json({
      errors: {
        default: 'The id parameter needs to be entered'
      }
    })
  }

  const result = await OrderProvider.getById(req.params.id, userId)

  if(result instanceof Error){
    if(result.message === 'Order not found'){
      return res.status(StatusCodes.NOT_FOUND).json({
        errors: {
          default: result.message
        }
      });
    }else if(result.message === 'You cant get this order'){
      return res.status(StatusCodes.FORBIDDEN).json({
        errors: {
          default: result.message
        }
      });
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errors: {
        default: result.message
      }
    })
  }
  return res.status(StatusCodes.OK).json(result)
}