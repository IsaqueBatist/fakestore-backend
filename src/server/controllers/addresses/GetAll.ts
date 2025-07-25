import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';
import { AddressProvider } from '../../database/providers/addresses';
import { validation } from '../../shared/middlewares/Validation';

interface IQueryProps {
  id?: number,
  page?: number
  limit?: number
  filter?: string
}


export const getAllValidation = validation( (getSchema) => ({
  query: getSchema<IQueryProps>(yup.object().shape({
    id: yup.number().optional().moreThan(0),
    page: yup.number().optional().moreThan(0),
    limit: yup.number().optional().moreThan(0),
    filter: yup.string().optional()
  }))
}));

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const getAll = async (req: Request<{}, {}, {}, IQueryProps>, res: Response) => {
  
  const result = await AddressProvider.getAll(req.query.page || 1, req.query.limit || 7, req.query.filter || '', Number(req.query.id) || 0)
  const count = await AddressProvider.count(req.query.filter);

  if (result instanceof Error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errors: {
        default: result.message
      }
    });
  }else if (count instanceof Error){
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errors: {
        default: count.message
      }
    });
  }
  
  res.setHeader('access-control-expose-headers', 'x-total-count') //Libera acesso ao navegador
  res.setHeader('x-total-count', count)


  return res.status(StatusCodes.OK).json(result)
};
