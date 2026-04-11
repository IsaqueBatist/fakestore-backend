import { Router } from "express";
import { CartController } from "../controllers/carts";
import { ensureAuthenticated } from "../shared/middlewares";

const cartsRouter = Router();

/**
 * @swagger
 * /v1/carts:
 *   get:
 *     summary: Obter carrinho do usuário
 *     description: Retorna o carrinho do usuário autenticado
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrinho recuperado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_cart:
 *                   type: number
 *                 user_id:
 *                   type: number
 *                 created_at:
 *                   type: string
 *       401:
 *         description: Usuário não autenticado
 */
cartsRouter.get("/", ensureAuthenticated, CartController.getByUserId);

/**
 * @swagger
 * /v1/carts/items:
 *   post:
 *     summary: Adicionar item ao carrinho
 *     description: Adiciona um novo item/produto ao carrinho do usuário
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product_id, quantity]
 *             properties:
 *               product_id:
 *                 type: number
 *                 example: 5
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *                 example: 2
 *     responses:
 *       201:
 *         description: Item adicionado ao carrinho com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product_id:
 *                   type: number
 *                   example: 5
 *                 quantity:
 *                   type: number
 *                   example: 2
 *                 price:
 *                   type: number
 *                   format: float
 *                   example: 99.99
 *       400:
 *         description: Dados inválidos - quantidade inválida
 *       401:
 *         description: Usuário não autenticado
 *       404:
 *         description: Produto não encontrado
 */
cartsRouter.post(
  "/items",
  ensureAuthenticated,
  CartController.addedItemValidation,
  CartController.addItem,
);

/**
 * @swagger
 * /v1/carts/items:
 *   get:
 *     summary: Listar itens do carrinho
 *     description: Retorna todos os itens do carrinho do usuário
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Itens do carrinho recuperados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_cart_item:
 *                     type: number
 *                   cart_id:
 *                     type: number
 *                   product_id:
 *                     type: number
 *                   quantity:
 *                     type: number
 *                   added_at:
 *                     type: string
 *       401:
 *         description: Usuário não autenticado
 */
cartsRouter.get("/items", ensureAuthenticated, CartController.getItem);

/**
 * @swagger
 * /v1/carts/items/{id}:
 *   put:
 *     summary: Atualizar item do carrinho
 *     description: Atualiza a quantidade de um item no carrinho
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *                 example: 5
 *     responses:
 *       200:
 *         description: Item atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_cart_item:
 *                   type: number
 *                 cart_id:
 *                   type: number
 *                 product_id:
 *                   type: number
 *                 quantity:
 *                   type: number
 *       400:
 *         description: Quantidade inválida
 *       401:
 *         description: Usuário não autenticado
 *       404:
 *         description: Item não encontrado
 */
cartsRouter.put(
  "/items/:id",
  ensureAuthenticated,
  CartController.updateByIdValidation,
  CartController.updateById,
);

/**
 * @swagger
 * /v1/carts/items/{id}:
 *   delete:
 *     summary: Remover item do carrinho
 *     description: Remove um item específico do carrinho
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         example: 1
 *     responses:
 *       204:
 *         description: Item removido com sucesso
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Usuário não autenticado
 *       404:
 *         description: Item não encontrado
 */
cartsRouter.delete(
  "/items/:id",
  ensureAuthenticated,
  CartController.deleteItemValidation,
  CartController.deleteItem,
);

/**
 * @swagger
 * /v1/carts:
 *   delete:
 *     summary: Limpar carrinho
 *     description: Remove todos os itens do carrinho do usuário
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Carrinho limpo com sucesso
 *       401:
 *         description: Usuário não autenticado
 *       500:
 *         description: Erro ao limpar carrinho
 */
cartsRouter.delete("/", ensureAuthenticated, CartController.cleanCart);

export { cartsRouter };
