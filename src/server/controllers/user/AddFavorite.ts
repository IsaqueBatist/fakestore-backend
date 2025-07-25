import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';
import { validation } from '../../shared/middlewares';
import { IUser_Favorite } from '../../database/models/User_favorite';
import { UserProvider } from '../../database/providers/user';

interface IBodyProps extends Omit<IUser_Favorite, 'user_id'> {}

export const addFavoriteValidation = validation((getSchema) => ({
    body: getSchema<IBodyProps>(yup.object().shape({
        product_id: yup.number().moreThan(0).required(),
    }))
}));

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const addFavorite = async (req: Request<{}, {}, IBodyProps>, res: Response) => {
  const userId = req.user?.id
  
  if (!userId){
    return res.status(StatusCodes.UNAUTHORIZED).json({
      errors: {
        default: 'User should be logged in'
      }
    })
  }
  

  const result = await UserProvider.addFavorite(req.body.product_id, userId)

  if(result instanceof Error){
    if (result.message === 'This product is already a favorite') {
      return res.status(StatusCodes.CONFLICT).json({
        errors: {
          default: result.message
        }
      })
    }else if (result.message === 'Product not found') {
      return res.status(StatusCodes.NOT_FOUND).json({
        errors: {
          default: result.message
        }
      })
    }else if (result.message === 'User not found') {
      return res.status(StatusCodes.NOT_FOUND).json({
        errors: {
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
