import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

interface IProduct {
  name: string
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const create = (req: Request<{}, {}, IProduct>, res: Response) => {
  if (req.body.name === undefined) {
    res.status(StatusCodes.BAD_REQUEST).send("Informe o atributo nome")
  }
  return res.send('Create');
};
