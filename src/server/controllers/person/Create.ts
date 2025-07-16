import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';
import { IPerson } from '../../database/models/Person';
import { PersonProvider } from '../../database/providers/person';
import { validation } from '../../shared/middlewares/Validation';

interface IBodyProps extends Omit<IPerson, 'id_person'> {}

export const createValidation = validation( (getSchema) => ({
  body: getSchema<IBodyProps>(yup.object().shape({
    firstName: yup.string().required().min(3),
    lastName: yup.string().required().min(3),
    email: yup.string().required().email(),
    productId: yup.number().integer().required().moreThan(0)
  }))
}));

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const create = async (req: Request<{}, {}, IPerson>, res: Response) => {
  const result = await PersonProvider.create(req.body)
  if(result instanceof Error){
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errors: {
        default: result.message
      }
    })
  }
  return res.status(StatusCodes.CREATED).json(result)
};
