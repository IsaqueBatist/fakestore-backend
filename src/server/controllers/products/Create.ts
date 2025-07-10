import { Request, Response } from 'express';

interface IProduct {
  name: string
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const create = (req: Request<{}, {}, IProduct>, res: Response) => { 
  console.log(req.body);
  return res.send('Create');
};
