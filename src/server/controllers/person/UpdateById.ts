import { StatusCodes } from "http-status-codes";
import { validation } from "../../shared/middlewares/Validation";
import * as yup from 'yup'
import { Request, Response } from "express";
import { IPerson } from "../../database/models/Person";
import { PersonProvider } from "../../database/providers/person";

interface IParamProps {
  id?: number;
}
interface IBodyProps extends Omit<IPerson, 'id_person'> {}

export const updateByIdValidation = validation(getSchema => ({
  params: getSchema<IParamProps>(yup.object().shape({
    id: yup.number().integer().required().moreThan(0)
  })),
  body: getSchema<IBodyProps>(yup.object().shape({
    firstName: yup.string().required().min(3),
    lastName: yup.string().required().min(3),
    email: yup.string().required().email(),
    productId: yup.number().required().moreThan(0)
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
  const result = await PersonProvider.updateById(req.params.id, req.body);
  
  if (result instanceof Error) {
    if(result.message === 'Person not found'){
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
    });
  }

  return res.status(StatusCodes.NO_CONTENT).send();
}