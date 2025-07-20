import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { JWTService } from "../../shared/services";
import { CartProvider } from "../../database/providers/carts";

export const getByUserId = async (req: Request, res: Response) => {
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
      errors: {default: 'JWT was not provided'}
    })
  } else if (userId === 'INVALID_TOKEN') {
    return res.status(StatusCodes.UNAUTHORIZED).send({
      errors: {defualt: 'Invalid token'}
    })
  }

  const result = await CartProvider.getByUserId(userId.uid)

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