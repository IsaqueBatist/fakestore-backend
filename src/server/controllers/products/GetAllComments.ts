import { Request, RequestHandler, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { validation } from '../../shared/middlewares/Validation';
import * as yup from 'yup';
import { ProductProvider } from '../../database/providers/products';

interface IParamsProps {
    id?: number
}

export const getAllCommentsValidation = validation((getSchema) => ({
    params: getSchema<IParamsProps>(yup.object().shape({
        id: yup.number().optional(),
    })),
}));


// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const getAllComments = async (req: Request<IParamsProps>, res: Response) => {
  if(!req.params.id){
    return res.status(StatusCodes.BAD_REQUEST).json({
      errors: {
          default: 'The id parameter needs to be entered'
      }
    })
  }
  
  const result = await ProductProvider.getAllComments(req.params.id)

  if (result instanceof Error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errors: {
        default: result.message
      }
    });
  }

  return res.status(StatusCodes.OK).json(result)
};
