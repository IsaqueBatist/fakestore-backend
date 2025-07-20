import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { OrderProvider } from "../../database/providers/orders";
import { JWTService } from "../../shared/services";

export const getByUserId = async (req: Request, res: Response) => {
  if (!req.headers.authorization){
    return res.status(StatusCodes.UNAUTHORIZED).json({
      errors: {
        default: 'User should be logged in'
      }
    })
  }

  const [type, token] = req.headers.authorization.split(' ')
  
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

  const result = await OrderProvider.getByUserId(userId.uid)

  if(result instanceof Error){
    if(result.message === 'Order not found'){
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