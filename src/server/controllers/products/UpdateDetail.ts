import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';
import { IProduct_Detail } from '../../database/models/Product_detail';
import { ProductProvider } from '../../database/providers/products';
import { validation } from '../../shared/middlewares';

interface IBodyProps extends Omit<IProduct_Detail, 'id_product_detail'| 'product_id'> {}
interface IParamsPropos {
    id?: number
}

export const updateDetailValidation = validation((getSchema) => ({
    params: getSchema<IParamsPropos>(yup.object().shape({
        id: yup.number().required()
    })),
    body: getSchema<IBodyProps>(yup.object().shape({
        weigth: yup.number().moreThan(0).required(),
        dimensions: yup.string().required(),
        manufacturer: yup.string().required(),
        material: yup.string().required()
    }))
}));

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const updateDetail = async (req: Request<IParamsPropos,IBodyProps>, res: Response) => {
  if(!req.params.id){
      return res.status(StatusCodes.BAD_REQUEST).json({
      errors: {
          default: 'The id parameter needs to be entered'
      }
    })
  }

  const result = await ProductProvider.updateDetail(req.body, req.params.id)

  if(result instanceof Error){
    if (result.message === 'Product not found') {
      return res.status(StatusCodes.NOT_FOUND).json({
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

  return res.status(StatusCodes.CREATED).json(result)
};
