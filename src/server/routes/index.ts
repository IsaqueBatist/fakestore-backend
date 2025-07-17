import { Router } from 'express';
import { PersonController, ProductController, UserController } from '../controllers';
import { ensureAuthenticated } from '../shared/middlewares';

const router = Router();

router.get('/products', ensureAuthenticated, ProductController.getlAllValidation, ProductController.getAll);
router.get('/products/:id', ensureAuthenticated, ProductController.getByIdValidation, ProductController.getById);
router.post('/products', ensureAuthenticated, ProductController.createValidation, ProductController.create);
router.put('/products/:id', ensureAuthenticated, ProductController.updateByIdValidation, ProductController.updateById);
router.delete('/products/:id', ensureAuthenticated, ProductController.deleteByIdValdation, ProductController.deleteById);

router.get('/people', ensureAuthenticated, PersonController.getlAllValidation, PersonController.getAll);
router.get('/people/:id', ensureAuthenticated, PersonController.getByIdValidation, PersonController.getById);
router.post('/people', ensureAuthenticated, PersonController.createValidation, PersonController.create);
router.put('/people/:id', ensureAuthenticated, PersonController.updateByIdValidation, PersonController.updateById);
router.delete('/people/:id', ensureAuthenticated, PersonController.deleteByIdValdation, PersonController.deleteById);

router.post('/login', UserController.signInValidation, UserController.signIn);
router.post('/register', UserController.signUpValidation, UserController.signUp);

export { router };

