import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';
import { IOrder } from '../../database/models/Order';
import { OrderProvider } from '../../database/providers/orders';
import { validation } from '../../shared/middlewares/Validation';
import { JWTService } from '../../shared/services';

interface IBodyProps extends Omit<IOrder, 'id_order' | 'created_at' | 'user_id'> {}

export const createValidation = validation( (getSchema) => ({
  body: getSchema<IBodyProps>(yup.object().shape({
    total: yup.number().required().moreThan(0),
    status: yup.string().required()
  }))
}));

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const create = async (req: Request<{}, {}, IOrder>, res: Response) => {
  if (!req.headers.authorization){
    return res.status(StatusCodes.UNAUTHORIZED).json({
      errors: {
        default: 'User should be logged in'
      }
    })
  }

  const userId = JWTService.verify(req.headers.authorization)

  if (userId === 'JWT_SECRET_NOT_FOUND') {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      errors: {default: 'JWT was not provided'}
    })
  } else if (userId === 'INVALID_TOKEN') {
    return res.status(StatusCodes.UNAUTHORIZED).send({
      errors: {defualt: 'Invalid token'}
    })
  }
  const result = await OrderProvider.create({...req.body, user_id: userId.uid})
  if(result instanceof Error){
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errors: {
        default: result.message
      }
    })
  }
  return res.status(StatusCodes.CREATED).json(result)
};
