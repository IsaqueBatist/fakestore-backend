import { Request, RequestHandler, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { validation } from '../../shared/middlewares/Validation';
import * as yup from 'yup';

interface IProduct {
  name: string
  age: number
}

interface IFilter {
  filter?: string;
  limit: number
}


export const createValidation = validation( (getSchema) => ({
  body: getSchema<IProduct>(yup.object().shape({
    name: yup.string().required().min(3),
    age: yup.number().required()
  })),
  query: getSchema<IFilter>(yup.object().shape({
    filter: yup.string().optional().min(3),
    limit: yup.number().required()
  }))
}));

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const create = async (req: Request<{}, {}, IProduct>, res: Response) => {
  return res.status(StatusCodes.CREATED).send(req.body);
};
