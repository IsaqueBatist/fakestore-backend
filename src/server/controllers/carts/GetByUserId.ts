import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { CartProvider } from "../../database/providers/carts";

export const getByUserId = async (req: Request, res: Response) => {
  const userId = req.user?.id
  
  if (!userId){
    return res.status(StatusCodes.UNAUTHORIZED).json({
      errors: {
        default: 'User should be logged in'
      }
    })
  }

  const result = await CartProvider.getByUserId(userId)

  if(result instanceof Error){
    if(result.message === 'Cart not found'){
      return res.status(StatusCodes.NOT_FOUND).json({
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