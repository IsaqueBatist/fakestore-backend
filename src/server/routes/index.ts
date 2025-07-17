import { Router } from 'express';
import { PersonController, ProductController, UserController } from '../controllers';

const router = Router();

router.get('/products', ProductController.getlAllValidation, ProductController.getAll);
router.get('/products/:id', ProductController.getByIdValidation, ProductController.getById);
router.post('/products', ProductController.createValidation, ProductController.create);
router.put('/products/:id', ProductController.updateByIdValidation, ProductController.updateById);
router.delete('/products/:id', ProductController.deleteByIdValdation, ProductController.deleteById);

router.get('/people', PersonController.getlAllValidation, PersonController.getAll);
router.get('/people/:id', PersonController.getByIdValidation, PersonController.getById);
router.post('/people', PersonController.createValidation, PersonController.create);
router.put('/people/:id', PersonController.updateByIdValidation, PersonController.updateById);
router.delete('/people/:id', PersonController.deleteByIdValdation, PersonController.deleteById);

router.post('/login', UserController.signInValidation, UserController.signIn);
router.post('/register', UserController.signUpValidation, UserController.signUp);

export { router };

