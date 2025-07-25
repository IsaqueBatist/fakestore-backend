import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CartProvider } from '../../database/providers/carts';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const cleanCart = async (req: Request, res: Response) => {
  const userId = req.user?.id
  
  if (!userId){
    return res.status(StatusCodes.UNAUTHORIZED).json({
      errors: {
        default: 'User should be logged in'
      }
    })
  }

  const result = await CartProvider.cleanCart(userId)
  
  if(result instanceof Error){
    if(result.message === 'No items found in cart to delete'){
      return res.status(StatusCodes.NOT_FOUND).json({
        errors:{
          default: result.message
        }
      })
    } else if(result.message === 'Cart item not found or unchanged'){
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
