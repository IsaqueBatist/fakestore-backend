import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';
import { ProductProvider } from '../../database/providers/products';
import { validation } from '../../shared/middlewares';
import { IProduct_Category } from '../../database/models/Product_category';

interface IBodyProps extends Omit<IProduct_Category, 'product_id'> {}
interface IParamsPropos {
    id?: number
}

export const addCategoryValidation = validation((getSchema) => ({
    params: getSchema<IParamsPropos>(yup.object().shape({
        id: yup.number().required()
    })),
    body: getSchema<IBodyProps>(yup.object().shape({
        category_id: yup.number().moreThan(0).required(),
    }))
}));

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const addCategory = async (req: Request<IParamsPropos, {}, IBodyProps>, res: Response) => {
  if(!req.params.id){
      return res.status(StatusCodes.BAD_REQUEST).json({
      errors: {
          default: 'The id parameter needs to be entered'
      }
    })
  }

  const result = await ProductProvider.addCategory(req.params.id, req.body.category_id)

  if(result instanceof Error){
    if (result.message === 'Product not found') {
      return res.status(StatusCodes.NOT_FOUND).json({
        errors: {
          default: result.message
        }
      })
    }else if (result.message === 'Category not found') {
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
