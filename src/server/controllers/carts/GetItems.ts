import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { JWTService } from '../../shared/services';
import { OrderProvider } from '../../database/providers/orders';
import { CartProvider } from '../../database/providers/carts';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const getItem = async (req: Request, res: Response) => {
  if (!req.headers.authorization){
    return res.status(StatusCodes.UNAUTHORIZED).json({
      errors: {
        default: 'User should be logged in'
      }
    })
  }

  const [_, token] = req.headers.authorization.split(' ')

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

  const result = await CartProvider.getItems(userId.uid)
  
  if(result instanceof Error){
    if(result.message === 'User dont have a cart'){
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

  return res.status(StatusCodes.CREATED).json(result)
};
