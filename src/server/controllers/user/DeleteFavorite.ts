import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';
import { validation } from '../../shared/middlewares';
import { UserProvider } from '../../database/providers/user';

interface IParamsPropos {
    id?: number
}

export const deleteFavoriteValidation = validation((getSchema) => ({
    params: getSchema<IParamsPropos>(yup.object().shape({
        id: yup.number().optional(),
    })),
}));

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const deleteFavorite = async (req: Request<IParamsPropos>, res: Response) => {
  if(!req.params.id){
      return res.status(StatusCodes.BAD_REQUEST).json({
      errors: {
          default: 'The id parameter needs to be entered'
      }
    })
  }
  const userId = req.user?.id
  
  if (!userId){
    return res.status(StatusCodes.UNAUTHORIZED).json({
      errors: {
        default: 'User should be logged in'
      }
    })
  }

  const result = await UserProvider.deleteFavorite(userId, req.params.id)

  if(result instanceof Error){
    if (result.message === 'Favorite not found') {
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

  return res.status(StatusCodes.NO_CONTENT).send()
};
