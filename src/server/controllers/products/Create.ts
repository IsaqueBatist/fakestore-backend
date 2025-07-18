import { Request, RequestHandler, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { validation } from '../../shared/middlewares/Validation';
import * as yup from 'yup';
import { IProduct } from '../../database/models';
import { ProductProvider } from '../../database/providers/products';

interface IBodyProps extends Omit<IProduct, 'id_product' | 'created_at'> {}

export const createValidation = validation( (getSchema) => ({
  body: getSchema<IBodyProps>(yup.object().shape({
    name: yup.string().required().min(3).max(150),
    description: yup.string().required(),
    price: yup.number().required().moreThan(0),
    image_url: yup.string().required(),
    rating: yup.number().required().moreThan(0)
  }))
}));

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const create = async (req: Request<{}, {}, IProduct>, res: Response) => {
  const result = await ProductProvider.create(req.body)
  if(result instanceof Error){
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errors: {
        default: result.message
      }
    })
  }
  return res.status(StatusCodes.CREATED).json(result)
};
