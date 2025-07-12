import { Request, RequestHandler, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { validation } from '../../shared/middlewares/Validation';
import * as yup from 'yup';

interface IProduct {
  name: string
  price: number
}


export const createValidation = validation( (getSchema) => ({
  body: getSchema<IProduct>(yup.object().shape({
    name: yup.string().required().min(3),
    price: yup.number().required()
  }))
}));

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const create = async (req: Request<{}, {}, IProduct>, res: Response) => {
  // return res.status(StatusCodes.CREATED).send(req.body);

  return res.status(StatusCodes.NOT_IMPLEMENTED).send("Não implementado")
};
