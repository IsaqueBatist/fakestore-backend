import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';
import { validation } from '../../shared/middlewares';
import { IUser_Favorite } from '../../database/models/User_favorite';
import { UserProvider } from '../../database/providers/user';
import { JWTService } from '../../shared/services';

interface IBodyProps extends Omit<IUser_Favorite, 'user_id'> {}

export const addFavoriteValidation = validation((getSchema) => ({
    body: getSchema<IBodyProps>(yup.object().shape({
        product_id: yup.number().moreThan(0).required(),
    }))
}));

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const addFavorite = async (req: Request<{}, {}, IBodyProps>, res: Response) => {
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

  const result = await UserProvider.addFavorite(req.body.product_id, userId.uid)

  if(result instanceof Error){
    if (result.message === 'Product not found') {
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
