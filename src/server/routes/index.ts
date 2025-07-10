import { Request, Response, Router } from 'express';
import { ProductController } from '../controllers';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.send('Ola');
});

router.post('/products', ProductController.create);

export { router };

