import { Router } from 'express';
import { ProductController, UserController } from '../controllers';
import { OrderController } from '../controllers/Orders';
import { AddressController } from '../controllers/addresses';
import { CartController } from '../controllers/carts';
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

router.get('/orders', ensureAuthenticated, OrderController.getByUserId);
router.post('/orders', ensureAuthenticated, OrderController.createValidation, OrderController.create);
router.put('/orders/:id', ensureAuthenticated, OrderController.updateByUserIdValidation, OrderController.updateById);
router.delete('/orders/:id', ensureAuthenticated, OrderController.deleteByIdValdation, OrderController.deleteById);

router.get('/carts', ensureAuthenticated, CartController.getByUserId);
router.post('/carts', ensureAuthenticated, CartController.addedItemValidation, CartController.additem);
router.put('/carts/items/:id', ensureAuthenticated, CartController.updateByIdValidation, CartController.updateById);
router.delete('/carts/items/:id', ensureAuthenticated, CartController.deleteItemValidation, CartController.deleteItem);
router.delete('/carts', ensureAuthenticated, CartController.cleanCaret);

router.get('/addresses', ensureAuthenticated, AddressController.getlAllValidation, AddressController.getAll);
router.get('/addresses/:id', ensureAuthenticated, AddressController.getByIdValidation, AddressController.getById);
router.post('/addresses', ensureAuthenticated, AddressController.createValidation, AddressController.create);
router.put('/addresses/:id', ensureAuthenticated, AddressController.updateByIdValidation, AddressController.updateById);
router.delete('/addresses/:id', ensureAuthenticated, AddressController.deleteByIdValdation, AddressController.deleteById);

router.post('/login', UserController.signInValidation, UserController.signIn);
router.post('/register', UserController.signUpValidation, UserController.signUp);

export { router };

