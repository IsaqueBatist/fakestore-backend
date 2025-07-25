import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';
import { ProductProvider } from '../../database/providers/products';
import { validation } from '../../shared/middlewares';

interface IParamsPropos {
    id?: number
    comment_id?: number
}

export const deleteCommentValidation = validation((getSchema) => ({
    params: getSchema<IParamsPropos>(yup.object().shape({
        id: yup.number().optional(),
        comment_id: yup.number().optional()
    })),
}));

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const deleteComment = async (req: Request<IParamsPropos>, res: Response) => {
  if (!req.params.id){
      return res.status(StatusCodes.BAD_REQUEST).json({
      errors: {
          default: 'The id parameter needs to be entered'
      }
    })
  }
  if (!req.params.comment_id){
      return res.status(StatusCodes.BAD_REQUEST).json({
      errors: {
          default: 'The comment_id parameter needs to be entered'
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
  

  const result = await ProductProvider.deleteComment(req.params.comment_id,req.params.id, userId)

  if(result instanceof Error){
    if (result.message === 'Comment not found') {
      return res.status(StatusCodes.NOT_FOUND).json({
        errors: {
          default: result.message
        }
      })
    }else if (result.message === 'You cant delete this comment') {
      return res.status(StatusCodes.FORBIDDEN).json({
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

  return res.status(StatusCodes.NO_CONTENT).send()
};
