import { Router } from 'express';
import { ProductController, UserController } from '../controllers';
import { OrderController } from '../controllers/Orders';
import { AddressController } from '../controllers/addresses';
import { CartController } from '../controllers/carts';
import { CategoryController } from '../controllers/catergories';
import { ensureAdmin, ensureAuthenticated } from '../shared/middlewares';

const router = Router();

//ACESSO PÚBLICO

// Autenticação
router.post('/login', UserController.signInValidation, UserController.signIn);
router.post('/register', UserController.signUpValidation, UserController.signUp);

//Produtos
router.get('/products', ProductController.getAllValidation, ProductController.getAll);
router.get('/products/:id', ProductController.getByIdValidation, ProductController.getById);
router.get('/products/:id/detail', ProductController.getDetailValidation, ProductController.getDetail);

//Categorias
router.get('/products/:id/categories', ProductController.getAllCategoriesValidation, ProductController.getAllCategories);

//Comentários
router.get('/products/:id/comments', ProductController.getAllCommentsValidation, ProductController.getAllComments);

//Categorias
router.get('/categories', CategoryController.getAllValidation, CategoryController.getAll);
router.get('/categories/:id', CategoryController.getByIdValidation, CategoryController.getById);

//ACESSO AUTENTICADO

//Comentários em produtos
router.post('/products/:id/comments', ensureAuthenticated, ProductController.addCommentValidation, ProductController.addComment);
router.delete('/products/:id/comments/:comment_id', ensureAuthenticated, ProductController.deleteCommentValidation, ProductController.deleteComment);
router.put('/products/:id/comments/:comment_id', ensureAuthenticated, ProductController.updateCommentValidation, ProductController.updatComment);

//Pedidos
router.get('/orders', ensureAuthenticated, OrderController.getByUserId);
router.get('/orders/:id', ensureAuthenticated, OrderController.getByIdValidation, OrderController.getById);
router.post('/orders/from-cart', ensureAuthenticated, OrderController.create);
router.put('/orders/:id', ensureAuthenticated, OrderController.updateByIdValidation, OrderController.updateById);
router.delete('/orders/:id', ensureAuthenticated, OrderController.deleteByIdValidation, OrderController.deleteById);

//Itens do pedido
router.get('/orders/:order_id/items', ensureAuthenticated, OrderController.getItem);
router.post('/orders/:order_id/items', ensureAuthenticated, OrderController.addedItemValidation, OrderController.additem);
router.delete('/orders/:order_id/items/:id', ensureAuthenticated, OrderController.deleteItemValidation, OrderController.deleteItem);
router.put('/orders/:order_id/items/:id', ensureAuthenticated, OrderController.updateItemValidation, OrderController.updateItem);

//Carrinho
router.get('/carts', ensureAuthenticated, CartController.getByUserId);
router.post('/carts/items', ensureAuthenticated, CartController.addedItemValidation, CartController.additem);
router.get('/carts/items', ensureAuthenticated, CartController.getItem);
router.put('/carts/items/:id', ensureAuthenticated, CartController.updateByIdValidation, CartController.updateById);
router.delete('/carts/items/:id', ensureAuthenticated, CartController.deleteItemValidation, CartController.deleteItem);
router.delete('/carts', ensureAuthenticated, CartController.cleanCart);

//Endereços
router.get('/addresses', ensureAuthenticated, AddressController.getAllValidation, AddressController.getAll);
router.get('/addresses/:id', ensureAuthenticated, AddressController.getByIdValidation, AddressController.getById);
router.post('/addresses', ensureAuthenticated, AddressController.createValidation, AddressController.create);
router.put('/addresses/:id', ensureAuthenticated, AddressController.updateByIdValidation, AddressController.updateById);
router.delete('/addresses/:id', ensureAuthenticated, AddressController.deleteByIdValidation, AddressController.deleteById);

//Favoritos
router.get('/favorites', ensureAuthenticated, UserController.getFavorites);
router.post('/favorites', ensureAuthenticated, UserController.addFavoriteValidation, UserController.addFavorite);
router.delete('/favorites/:id', ensureAuthenticated, UserController.deleteFavoriteValidation, UserController.deleteFavorite);


//ACESSO ADMINISTRADOR

//Produtos
router.post('/products', ensureAuthenticated, ensureAdmin, ProductController.createValidation, ProductController.create);
router.put('/products/:id', ensureAuthenticated, ensureAdmin, ProductController.updateByIdValidation, ProductController.updateById);
router.delete('/products/:id', ensureAuthenticated, ensureAdmin, ProductController.deleteByIdValidation, ProductController.deleteById);

router.post('/products/:id/detail', ensureAuthenticated, ensureAdmin, ProductController.addDetailValidation, ProductController.addDetail);
router.delete('/products/:id/detail', ensureAuthenticated, ensureAdmin, ProductController.deleteDetailValidation, ProductController.deleteDetail);
router.put('/products/:id/detail', ensureAuthenticated, ensureAdmin, ProductController.updateDetailValidation, ProductController.updateDetail);

router.post('/products/:id/categories', ensureAuthenticated, ensureAdmin, ProductController.addCategoryValidation, ProductController.addCategory);
router.delete('/products/:id/categories/:category_id', ensureAuthenticated, ensureAdmin, ProductController.deleteCategoryValidation, ProductController.deleteCategory);

//Categorias
router.post('/categories', ensureAuthenticated, ensureAdmin, CategoryController.createValidation, CategoryController.create);
router.put('/categories/:id', ensureAuthenticated, ensureAdmin, CategoryController.updateByIdValidation, CategoryController.updateById);
router.delete('/categories/:id', ensureAuthenticated, ensureAdmin, CategoryController.deleteByIdValidation, CategoryController.deleteById);


export { router };

