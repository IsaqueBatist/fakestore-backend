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
  return res.status(StatusCodes.NOT_IMPLEMENTED).send("Não implementado")
}