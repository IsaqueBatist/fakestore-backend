import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';
import { ProductProvider } from '../../database/providers/products';
import { validation } from '../../shared/middlewares';

interface IParamsPropos {
    id?: number
}

export const deleteDetailValidation = validation((getSchema) => ({
    params: getSchema<IParamsPropos>(yup.object().shape({
        id: yup.number().required()
    })),
}));

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const deleteDetail = async (req: Request<IParamsPropos>, res: Response) => {
  if(!req.params.id){
      return res.status(StatusCodes.BAD_REQUEST).json({
      errors: {
          default: 'The id parameter needs to be entered'
      }
    })
  }

  const result = await ProductProvider.deleteDetail(req.params.id)

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
