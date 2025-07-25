import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';
import { IAddress } from '../../database/models/Addresses';
import { AddressProvider } from '../../database/providers/addresses';
import { validation } from '../../shared/middlewares/Validation';

interface IBodyProps extends Omit<IAddress, 'id_address' | 'user_id'> {}

export const createValidation = validation( (getSchema) => ({
  body: getSchema<IBodyProps>(yup.object().shape({
    street: yup.string().required(),
    city: yup.string().required(),
    state: yup.string().required(),
    zip_code: yup.string().required().matches(/^\d{5}-?\d{3}$/, 'CEP deve estar no formato 00000-000'),
    country: yup.string().required()
  }))
}));

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const create = async (req: Request<{}, {}, IAddress>, res: Response) => {
  const userId = req.user?.id
  
  if (!userId){
    return res.status(StatusCodes.UNAUTHORIZED).json({
      errors: {
        default: 'User should be logged in'
      }
    })
  }
  const result = await AddressProvider.create(req.body, userId)
  
  if (result instanceof Error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errors: {
        default: result.message
      }
    })
  }
  return res.status(StatusCodes.CREATED).json(result)
};
