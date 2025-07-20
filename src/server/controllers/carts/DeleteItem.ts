import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { JWTService } from '../../shared/services';
import { CartProvider } from '../../database/providers/carts';
import * as yup from 'yup'
import { validation } from '../../shared/middlewares';

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
  if (!req.headers.authorization){
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

  const result = await CartProvider.deleteItem(userId.uid, req.params.id)

  if(result instanceof Error){
    if(result.message === 'Cart not found for user'){
      return res.status(StatusCodes.NOT_FOUND).json({
        errors:{
          default: result.message
        }
      })
    } else if(result.message === 'Cart not found'){
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

  return res.status(StatusCodes.NO_CONTENT).send()
};
