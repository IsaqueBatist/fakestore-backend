import { Request, Response, Router } from 'express';
import { ProductController } from '../controllers';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.send('Ola');
});

router.get('/products', ProductController.getlAllValidation, ProductController.getAll);
router.get('/products/:id', ProductController.getByIdValidation, ProductController.getById);
router.post('/products', ProductController.createValidation, ProductController.create);
router.put('/products/:id', ProductController.updateByIdValidation, ProductController.updateById);
router.delete('/products/:id', ProductController.deleteByIdValdation, ProductController.deleteById);

export { router };

