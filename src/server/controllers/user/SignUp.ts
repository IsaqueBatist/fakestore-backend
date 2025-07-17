import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';
import { IUser } from '../../database/models';
import { UserProvider } from '../../database/providers/user';
import { validation } from '../../shared/middlewares/Validation';

interface IBodyProps extends Omit<IUser, 'id_user'> {}

export const signUpValidation = validation( (getSchema) => ({
  body: getSchema<IBodyProps>(yup.object().shape({
      firstName: yup.string().required().min(3),
      lastName: yup.string().required().min(3),
      email: yup.string().required().email().min(5),
      password: yup.string().required().min(6)
  }))
}));

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const signUp = async (req: Request<{}, {}, IUser>, res: Response) => {
  const result = await UserProvider.create(req.body)
  if(result instanceof Error){
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errors: {
        default: result.message
      }
    })
  }
  return res.status(StatusCodes.CREATED).json(result)
};
