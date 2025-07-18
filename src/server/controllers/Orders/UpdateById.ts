import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as yup from 'yup';
import { ICategory } from "../../database/models";
import { CategoryProvider } from "../../database/providers/categories";
import { validation } from "../../shared/middlewares/Validation";

interface IParamProps {
  id?: number;
}
interface IBodyProps extends Omit<ICategory, 'id_category'> {}

export const updateByIdValidation = validation(getSchema => ({
  params: getSchema<IParamProps>(yup.object().shape({
    id: yup.number().integer().required().moreThan(0)
  })),
  body: getSchema<IBodyProps>(yup.object().shape({
    name: yup.string().required().min(3).max(150),
    description: yup.string().required()
  }))
}))

export const updateById = async (req: Request<IParamProps>, res: Response) => {
    if(!req.params.id){
      return res.status(StatusCodes.BAD_REQUEST).json({
        errors: {
          default: 'The id parameter needs to be entered'
        }
      })
    }
  const result = await CategoryProvider.updateById(req.params.id, req.body);
  
  if (result instanceof Error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errors: {
        default: result.message
      }
    });
  }

  return res.status(StatusCodes.NO_CONTENT).send();
}