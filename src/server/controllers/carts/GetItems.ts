import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { OrderProvider } from '../../database/providers/orders';
import { CartProvider } from '../../database/providers/carts';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const getItem = async (req: Request, res: Response) => {
  const userId = req.user?.id
  
  if (!userId){
    return res.status(StatusCodes.UNAUTHORIZED).json({
      errors: {
        default: 'User should be logged in'
      }
    })
  }

  const result = await CartProvider.getItems(userId)
  
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
