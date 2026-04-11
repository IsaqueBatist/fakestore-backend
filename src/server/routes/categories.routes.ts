import { Router } from "express";
import { CategoryController } from "../controllers/categories";
import { ensureAuthenticated, ensureAdmin } from "../shared/middlewares";

const categoriesRouter = Router();

/**
 * @swagger
 * /v1/categories:
 *   get:
 *     summary: Listar categorias
 *     description: Retorna lista de todas as categorias de produtos
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Categorias recuperadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_category:
 *                     type: number
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 */
categoriesRouter.get(
  "/categories",
  CategoryController.getAllValidation,
  CategoryController.getAll,
);

/**
 * @swagger
 * /v1/categories/{id}:
 *   get:
 *     summary: Obter categoria por ID
 *     description: Retorna os detalhes de uma categoria específica
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         example: 1
 *     responses:
 *       200:
 *         description: Categoria encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_category:
 *                   type: number
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Categoria não encontrada
 */
categoriesRouter.get(
  "/categories/:id",
  CategoryController.getByIdValidation,
  CategoryController.getById,
);

/**
 * @swagger
 * /v1/categories:
 *   post:
 *     summary: Criar nova categoria (admin)
 *     description: Cria uma nova categoria de produtos (requer permissão de admin)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 example: "Eletrônicos"
 *               description:
 *                 type: string
 *                 example: "Produtos eletrônicos em geral"
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_category:
 *                   type: number
 *                   example: 1
 *       400:
 *         description: Dados inválidos ou ausentes
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Permissão negada - Apenas admin pode criar categorias
 */
categoriesRouter.post(
  "/categories",
  ensureAuthenticated,
  ensureAdmin,
  CategoryController.createValidation,
  CategoryController.create,
);

/**
 * @swagger
 * /v1/categories/{id}:
 *   put:
 *     summary: Atualizar categoria (admin)
 *     description: Atualiza os dados de uma categoria existente (requer permissão de admin)
 *     tags: [Categories]
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
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Categoria atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_category:
 *                   type: number
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Permissão negada - Apenas admin
 *       404:
 *         description: Categoria não encontrada
 */
categoriesRouter.put(
  "/categories/:id",
  ensureAuthenticated,
  ensureAdmin,
  CategoryController.updateByIdValidation,
  CategoryController.updateById,
);

/**
 * @swagger
 * /v1/categories/{id}:
 *   delete:
 *     summary: Deletar categoria (admin)
 *     description: Remove uma categoria do sistema (requer permissão de admin)
 *     tags: [Categories]
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
 *         description: Categoria deletada com sucesso
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Permissão negada - Apenas admin
 *       404:
 *         description: Categoria não encontrada
 */
categoriesRouter.delete(
  "/categories/:id",
  ensureAuthenticated,
  ensureAdmin,
  CategoryController.deleteByIdValidation,
  CategoryController.deleteById,
);

export { categoriesRouter };
