import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';
import { IUser } from '../../database/models';
import { UserProvider } from '../../database/providers/user';
import { validation } from '../../shared/middlewares/Validation';
import { passwordCrypto, JWTService } from '../../shared/services';

interface IBodyProps extends Omit<IUser, 'id_user' | 'firstName' | 'lastName'> {}

export const signInValidation = validation( (getSchema) => ({
  body: getSchema<IBodyProps>(yup.object().shape({
      email: yup.string().required().email().min(5),
      password: yup.string().required().min(6)
  }))
}));

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const signIn = async (req: Request<{}, {}, IBodyProps>, res: Response) => {

  const { email, password } = req.body

  const result = await UserProvider.getByEmail(email)

  if (result instanceof Error) {
    if (result.message === 'User not found') {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        errors: {
          default: 'Incorrect email or password'
        }
      })
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errors: {
        default: result.message
      }
    })
  }
  
  const passowrdMatch = await passwordCrypto.verifyPassword(password, result.password)

  if (!passowrdMatch) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      errors: {
        default: 'Incorrect email or password'
      }
    })
  }

  const accessToken = JWTService.sign({ uid: result.id_user })
  if (accessToken === 'JWT_SECRET_NOT_FOUND') {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      errors: {
        default: 'Error generating JWT token'
      }
    })
  }
  
  return res.status(StatusCodes.OK).json({
    accessToken
  })
};
