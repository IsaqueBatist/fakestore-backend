import { StatusCodes } from "http-status-codes";
import { validation } from "../../shared/middlewares/Validation";
import * as yup from 'yup'
import { Request, Response } from "express";

interface IParamProps {
  id?: number;
}

export const getByIdValidation = validation(getSchema => ({
  params: getSchema<IParamProps>(yup.object().shape({
    id: yup.number().integer().required().moreThan(0)
  }))
}))

export const getById = async (req: Request<IParamProps>, res: Response) => {
    if(Number(req.params.id) === 9999){
    return res.status(StatusCodes.NOT_FOUND).json({
      errors: {
        default: 'Produto não encontrado'
      }
    })
  }
  return res.status(StatusCodes.OK).json({
    id: Number(req.params.id),
    name: 'Notebook',
    price: 120
  })
}