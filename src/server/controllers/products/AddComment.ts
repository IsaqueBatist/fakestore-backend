import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';
import { ProductProvider } from '../../database/providers/products';
import { validation } from '../../shared/middlewares';
import { IProduct_Comment } from '../../database/models';

interface IBodyProps extends Omit<IProduct_Comment, 'product_id' | 'id_product_comment' | 'user_id'> {}
interface IParamsPropos {
    id?: number
}

export const addCommentValidation = validation((getSchema) => ({
    params: getSchema<IParamsPropos>(yup.object().shape({
        id: yup.number().required()
    })),
    body: getSchema<IBodyProps>(yup.object().shape({
        comment: yup.string().required()
    }))
}));

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const addComment = async (req: Request<IParamsPropos, {}, IBodyProps>, res: Response) => {
  if(!req.params.id){
    return res.status(StatusCodes.BAD_REQUEST).json({
      errors: {
          default: 'The id parameter needs to be entered'
      }
    })
  }
  const userId = req.user?.id
  
  if (!userId){
    return res.status(StatusCodes.UNAUTHORIZED).json({
      errors: {
        default: 'User should be logged in'
      }
    })
  }
  

  const result = await ProductProvider.addComment(req.params.id, req.body, userId)

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
