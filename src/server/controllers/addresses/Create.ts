import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';
import { IAddress } from '../../database/models/Addresses';
import { AddressProvider } from '../../database/providers/addresses';
import { validation } from '../../shared/middlewares/Validation';
import { JWTService } from '../../shared/services';

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

  const result = await AddressProvider.create(req.body, userId.uid)
  
  if (result instanceof Error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errors: {
        default: result.message
      }
    })
  }
  return res.status(StatusCodes.CREATED).json(result)
};
