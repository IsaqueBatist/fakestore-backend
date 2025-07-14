import { Request, RequestHandler, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { validation } from '../../shared/middlewares/Validation';
import * as yup from 'yup';
import { IProduct } from '../../database/models';

interface IBodyProps extends Omit<IProduct, 'id'> {}

export const createValidation = validation( (getSchema) => ({
  body: getSchema<IBodyProps>(yup.object().shape({
    name: yup.string().required().min(3),
  }))
}));

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const create = async (req: Request<{}, {}, IProduct>, res: Response) => {
  // return res.status(StatusCodes.CREATED).send(req.body);

  return res.status(StatusCodes.CREATED).json(1)
};
