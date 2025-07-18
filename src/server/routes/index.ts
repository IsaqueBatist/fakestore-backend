import { Router } from 'express';
import { ProductController, UserController } from '../controllers';
import { CategoryController } from '../controllers/catergories';
import { ensureAuthenticated } from '../shared/middlewares';

const router = Router();

router.get('/products', ensureAuthenticated, ProductController.getlAllValidation, ProductController.getAll);
router.get('/products/:id', ensureAuthenticated, ProductController.getByIdValidation, ProductController.getById);
router.post('/products', ensureAuthenticated, ProductController.createValidation, ProductController.create);
router.put('/products/:id', ensureAuthenticated, ProductController.updateByIdValidation, ProductController.updateById);
router.delete('/products/:id', ensureAuthenticated, ProductController.deleteByIdValdation, ProductController.deleteById);

router.get('/categories', ensureAuthenticated, CategoryController.getlAllValidation, CategoryController.getAll);
router.get('/categories/:id', ensureAuthenticated, CategoryController.getByIdValidation, CategoryController.getById);
router.post('/categories', ensureAuthenticated, CategoryController.createValidation, CategoryController.create);
router.put('/categories/:id', ensureAuthenticated, CategoryController.updateByIdValidation, CategoryController.updateById);
router.delete('/categories/:id', ensureAuthenticated, CategoryController.deleteByIdValdation, CategoryController.deleteById);





router.post('/login', UserController.signInValidation, UserController.signIn);
router.post('/register', UserController.signUpValidation, UserController.signUp);

export { router };

