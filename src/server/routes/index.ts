import { Router } from 'express';
import { ProductController, UserController } from '../controllers';
import { OrderController } from '../controllers/Orders';
import { AddressController } from '../controllers/addresses';
import { CartController } from '../controllers/carts';
import { CategoryController } from '../controllers/catergories';
import { ensureAuthenticated } from '../shared/middlewares';

const router = Router();

router.get('/products', ensureAuthenticated, ProductController.getAllValidation, ProductController.getAll);
router.get('/products/:id', ensureAuthenticated, ProductController.getByIdValidation, ProductController.getById);
router.post('/products', ensureAuthenticated, ProductController.createValidation, ProductController.create);
router.put('/products/:id', ensureAuthenticated, ProductController.updateByIdValidation, ProductController.updateById);
router.delete('/products/:id', ensureAuthenticated, ProductController.deleteByIdValidation, ProductController.deleteById);

router.get('/products/:id/detail', ensureAuthenticated, ProductController.getDetailValidation, ProductController.getDetail);
router.post('/products/:id/detail', ensureAuthenticated, ProductController.addDetailValidation, ProductController.addDetail);
router.delete('/products/:id/detail', ensureAuthenticated, ProductController.deleteDetailValidation, ProductController.deleteDetail);
router.put('/products/:id/detail', ensureAuthenticated, ProductController.updateDetailValidation, ProductController.updateDetail);

router.get('/products/:id/categories', ensureAuthenticated, ProductController.getAllCategoriesValidation, ProductController.getAllCategories);
router.post('/products/:id/categories', ensureAuthenticated, ProductController.addCategoryValidation, ProductController.addCategory);
router.delete('/products/:id/categories/:category_id', ensureAuthenticated, ProductController.deleteCategoryValidation, ProductController.deleteCategory);

router.get('/products/:id/comments', ensureAuthenticated, ProductController.getAllCommentsValidation, ProductController.getAllComments);
router.post('/products/:id/comments', ensureAuthenticated, ProductController.addCommentValidation, ProductController.addComment);
router.delete('/products/:id/comments/:comment_id', ensureAuthenticated, ProductController.deleteCommentValidation, ProductController.deleteComment);
router.put('/products/:id/comments/:comment_id', ensureAuthenticated, ProductController.updateCommentValidation, ProductController.updatComment);

router.get('/categories', ensureAuthenticated, CategoryController.getAllValidation, CategoryController.getAll);
router.get('/categories/:id', ensureAuthenticated, CategoryController.getByIdValidation, CategoryController.getById);
router.post('/categories', ensureAuthenticated, CategoryController.createValidation, CategoryController.create);
router.put('/categories/:id', ensureAuthenticated, CategoryController.updateByIdValidation, CategoryController.updateById);
router.delete('/categories/:id', ensureAuthenticated, CategoryController.deleteByIdValidation, CategoryController.deleteById);

router.get('/orders', ensureAuthenticated, OrderController.getByUserId);
router.post('/orders', ensureAuthenticated, OrderController.createValidation, OrderController.create);
router.put('/orders/:id', ensureAuthenticated, OrderController.updateByUserIdValidation, OrderController.updateById);
router.delete('/orders/:id', ensureAuthenticated, OrderController.deleteByIdValidation, OrderController.deleteById);

router.get('/orders/items', ensureAuthenticated, OrderController.getItem);
router.post('/orders/items', ensureAuthenticated, OrderController.addedItemValidation, OrderController.additem);
router.delete('/orders/items/:id', ensureAuthenticated, OrderController.deleteItemValidation, OrderController.deleteItem);
router.put('/orders/items/:id', ensureAuthenticated, OrderController.updateItemValidation, OrderController.updateItem);

router.get('/carts', ensureAuthenticated, CartController.getByUserId);
router.post('/carts', ensureAuthenticated, CartController.addedItemValidation, CartController.additem);

router.put('/carts/items/:id', ensureAuthenticated, CartController.updateByIdValidation, CartController.updateById);
router.delete('/carts/items/:id', ensureAuthenticated, CartController.deleteItemValidation, CartController.deleteItem);
router.delete('/carts', ensureAuthenticated, CartController.cleanCart);

router.get('/addresses', ensureAuthenticated, AddressController.getAllValidation, AddressController.getAll);
router.get('/addresses/:id', ensureAuthenticated, AddressController.getByIdValidation, AddressController.getById);
router.post('/addresses', ensureAuthenticated, AddressController.createValidation, AddressController.create);
router.put('/addresses/:id', ensureAuthenticated, AddressController.updateByIdValidation, AddressController.updateById);
router.delete('/addresses/:id', ensureAuthenticated, AddressController.deleteByIdValidation, AddressController.deleteById);

router.post('/login', UserController.signInValidation, UserController.signIn);
router.post('/register', UserController.signUpValidation, UserController.signUp);

router.get('/favorites', ensureAuthenticated, UserController.getFavorites);
router.post('/favorites', ensureAuthenticated, UserController.addFavoriteValidation, UserController.addFavorite);
router.delete('/favorites/:id', ensureAuthenticated, UserController.deleteFavoriteValidation, UserController.deleteFavorite);


export { router };

