import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';
import { IUser } from '../../database/models';
import { CartProvider } from '../../database/providers/carts';
import { UserProvider } from '../../database/providers/user';
import { validation } from '../../shared/middlewares/Validation';

interface IBodyProps extends Omit<IUser, 'id_user' | 'created_at' | 'role'> {}

export const signUpValidation = validation( (getSchema) => ({
  body: getSchema<IBodyProps>(yup.object().shape({
      name: yup.string().required().min(3),
      email: yup.string().required().email().min(5),
      password_hash: yup.string().required().min(6)
  }))
}));

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const signUp = async (req: Request<{}, {}, IUser>, res: Response) => {
  const result = await UserProvider.create(req.body)

  if(result instanceof Error){
    if(result.message === 'This email is already in use'){
      return res.status(StatusCodes.BAD_REQUEST).json({
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
  
  const cart = await CartProvider.createCart(result)

  if (cart instanceof Error) {
    if (cart.message === 'Cart already exists for this user.') {
      return res.status(StatusCodes.CONFLICT).json({
        errors: {
          default: cart.message
        }
      })
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errors: {
        default: cart.message
      }
    })
  }

  return res.status(StatusCodes.CREATED).json(result)
};
