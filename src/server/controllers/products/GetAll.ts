import { Request, RequestHandler, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { validation } from '../../shared/middlewares/Validation';
import * as yup from 'yup';

interface IQueryProps {
  page?: number
  limit?: number
  filter?: string
}


export const getlAllValidation = validation( (getSchema) => ({
  query: getSchema<IQueryProps>(yup.object().shape({
    page: yup.number().optional().moreThan(0),
    limit: yup.number().optional().moreThan(0),
    filter: yup.string().optional()
  }))
}));

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const getAll = async (req: Request<{}, {}, {}, IQueryProps>, res: Response) => {
  // return res.status(StatusCodes.CREATED).send(req.body);
  console.log(req.query)
  return res.status(StatusCodes.NOT_IMPLEMENTED).send("Não implementado")
};
