import { Router } from "express";
import { UserController } from "../controllers";
import { ensureAuthenticated } from "../shared/middlewares";

const favoritesRouter = Router();

/**
 * @swagger
 * /v1/favorites:
 *   get:
 *     summary: Listar favoritos
 *     description: Retorna todos os produtos marcados como favoritos do usuário
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Favoritos recuperados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_product:
 *                     type: number
 *                   name:
 *                     type: string
 *                   price:
 *                     type: number
 *                   image_url:
 *                     type: string
 *       401:
 *         description: Usuário não autenticado
 */
favoritesRouter.get("/", ensureAuthenticated, UserController.getFavorites);

/**
 * @swagger
 * /v1/favorites:
 *   post:
 *     summary: Adicionar produto aos favoritos
 *     description: Marca um produto como favorito do usuário
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product_id]
 *             properties:
 *               product_id:
 *                 type: number
 *                 example: 5
 *     responses:
 *       201:
 *         description: Produto adicionado aos favoritos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_product:
 *                   type: number
 *                 name:
 *                   type: string
 *                 price:
 *                   type: number
 *       400:
 *         description: Product ID inválido
 *       401:
 *         description: Usuário não autenticado
 *       404:
 *         description: Produto não encontrado
 */
favoritesRouter.post(
  "/",
  ensureAuthenticated,
  UserController.addFavoriteValidation,
  UserController.addFavorite,
);

/**
 * @swagger
 * /v1/favorites/{id}:
 *   delete:
 *     summary: Remover produto dos favoritos
 *     description: Remove um produto da lista de favoritos do usuário
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         example: 5
 *     responses:
 *       204:
 *         description: Produto removido dos favoritos
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Usuário não autenticado
 *       404:
 *         description: Favorito não encontrado
 */
favoritesRouter.delete(
  "/:id",
  ensureAuthenticated,
  UserController.deleteFavoriteValidation,
  UserController.deleteFavorite,
);

export { favoritesRouter };
