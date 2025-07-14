import { StatusCodes } from "http-status-codes";
import { validation } from "../../shared/middlewares/Validation";
import * as yup from 'yup'
import { Request, Response } from "express";
import { IProduct } from "../../database/models";

interface IParamProps {
  id?: number;
}
interface IBodyProps extends Omit<IProduct, 'id'> {}

export const updateByIdValidation = validation(getSchema => ({
  params: getSchema<IParamProps>(yup.object().shape({
    id: yup.number().integer().required().moreThan(0)
  })),
  body: getSchema<IBodyProps>(yup.object().shape({
    name: yup.string().required().min(3),
    price: yup.number().required().moreThan(0)
  }))
}))

export const updateById = async (req: Request<IParamProps>, res: Response) => {
  return res.status(StatusCodes.NO_CONTENT).send(req.body)
}