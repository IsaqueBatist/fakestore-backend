import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { OrderProvider } from '../../database/providers/orders';


// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const create = async (req: Request, res: Response) => {
  const userId = req.user?.id
  
  if (!userId){
    return res.status(StatusCodes.UNAUTHORIZED).json({
      errors: {
        default: 'User should be logged in'
      }
    })
  }  
  const result = await OrderProvider.create(userId)

  if(result instanceof Error){
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errors: {
        default: result.message
      }
    })
  }
  return res.status(StatusCodes.CREATED).json(result)
};
