import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';
interface IProduct {
  name: string
  age: number
}

const bodyValidation: yup.ObjectSchema<IProduct> = yup.object().shape({
  name: yup.string().required().min(3),
  age: yup.number().required()
})

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const create = async (req: Request<{}, {}, IProduct>, res: Response) => {
  let validatedData: IProduct | undefined = undefined
  try {
    validatedData = await bodyValidation.validate(req.body, {abortEarly: false});
  } catch (error) {
    const yupeError = error as yup.ValidationError;
    const validationErros: Record<string, string> = {}
    
    yupeError.inner.forEach(error => {
      if (!error.path) return;
      validationErros[error.path] = error.message;
    })

    return res.status(StatusCodes.BAD_REQUEST).json({
      errors: validationErros
    })
  }

  return res.status(StatusCodes.CREATED).send(validatedData);
};
