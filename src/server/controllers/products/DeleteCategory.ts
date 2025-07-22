import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';
import { ProductProvider } from '../../database/providers/products';
import { validation } from '../../shared/middlewares';

interface IParamsPropos {
    id?: number
    category_id?: number
}

export const deleteCategoryValidation = validation((getSchema) => ({
    params: getSchema<IParamsPropos>(yup.object().shape({
        id: yup.number().optional(),
        category_id: yup.number().optional()
    })),
}));

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const deleteCategory = async (req: Request<IParamsPropos>, res: Response) => {
  if(!req.params.id){
      return res.status(StatusCodes.BAD_REQUEST).json({
      errors: {
          default: 'The id parameter needs to be entered'
      }
    })
  }
  if(!req.params.category_id){
      return res.status(StatusCodes.BAD_REQUEST).json({
      errors: {
          default: 'The category_id parameter needs to be entered'
      }
    })
  }

  const result = await ProductProvider.deleteCategory(req.params.category_id, req.params.id)

  if(result instanceof Error){
    if (result.message === 'Category not found') {
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
