import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from 'yup';
import { IAddress } from "../../database/models/Addresses";
import { AddressProvider } from "../../database/providers/addresses";
import { validation } from "../../shared/middlewares/Validation";
import { JWTService } from "../../shared/services";

interface IParamProps {
  id?: number;
}
interface IBodyProps extends Omit<IAddress, 'id_address' | 'user_id'> {}

export const updateByIdValidation = validation(getSchema => ({
  params: getSchema<IParamProps>(yup.object().shape({
    id: yup.number().integer().required().moreThan(0)
  })),
  body: getSchema<IBodyProps>(yup.object().shape({
    street: yup.string().required(),
    city: yup.string().required(),
    state: yup.string().required(),
    zip_code: yup.string().required().matches(/^\d{5}-?\d{3}$/, 'CEP deve estar no formato 00000-000'),
    country: yup.string().required()
  }))
}))

export const updateById = async (req: Request<IParamProps>, res: Response) => {
  if(!req.params.id){
    return res.status(StatusCodes.BAD_REQUEST).json({
      errors: {
        default: 'The id parameter needs to be entered'
      }
    })
  }
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

  
  const result = await AddressProvider.updateById(req.params.id, req.body, userId.uid);
  
  if(result instanceof Error){
    if(result.message === 'Address not found'){
      return res.status(StatusCodes.NOT_FOUND).json({
        errors: {
          default: result.message
        }
      });
    } else if (result.message === 'You do not have permission to update this address.') {
      return res.status(StatusCodes.FORBIDDEN).json({
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

  return res.status(StatusCodes.NO_CONTENT).send();
}