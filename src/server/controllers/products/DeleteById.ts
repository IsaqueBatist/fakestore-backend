import { StatusCodes } from "http-status-codes";
import { validation } from "../../shared/middlewares/Validation";
import * as yup from 'yup'
import { Request, Response } from "express";
import { ProductProvider } from "../../database/providers/products";

interface IParamProps {
  id?: number;
}

export const deleteByIdValdation = validation(getSchema => ({
  params: getSchema<IParamProps>(yup.object().shape({
    id: yup.number().integer().required().moreThan(0)
  }))
}))

export const deleteById = async (req: Request<IParamProps>, res: Response) => {
  console.log('Requisição: ', req.params.id)
  const result = await ProductProvider.deleteById(req.params.id!)
  if(Number(req.params.id) === 9999){
    return res.status(StatusCodes.NOT_FOUND).json({
      errors: {
        default: 'Produto não encontrado'
      }
    })
  }

  return res.status(StatusCodes.NO_CONTENT).json(result)
}