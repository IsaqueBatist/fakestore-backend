import { Router } from 'express';
import { ProductController, UserController } from '../controllers';
import { ensureAuthenticated } from '../shared/middlewares';

const router = Router();

router.get('/products', ensureAuthenticated, ProductController.getlAllValidation, ProductController.getAll);
router.get('/products/:id', ensureAuthenticated, ProductController.getByIdValidation, ProductController.getById);
router.post('/products', ensureAuthenticated, ProductController.createValidation, ProductController.create);
router.put('/products/:id', ensureAuthenticated, ProductController.updateByIdValidation, ProductController.updateById);
router.delete('/products/:id', ensureAuthenticated, ProductController.deleteByIdValdation, ProductController.deleteById);

router.post('/login', UserController.signInValidation, UserController.signIn);
router.post('/register', UserController.signUpValidation, UserController.signUp);

export { router };

