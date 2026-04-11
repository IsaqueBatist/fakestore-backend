import { Router } from "express";
import { ProductController } from "../controllers";
import { ensureAuthenticated, ensureAdmin } from "../shared/middlewares";

const productsRouter = Router();

/**
 * @swagger
 * /v1/products:
 *   get:
 *     summary: Listar produtos
 *     description: Retorna lista de todos os produtos com suporte a paginação e filtros
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Cursor opaco para paginação (obtido na resposta anterior)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Itens por página (padrão 10)
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *         description: Filtro de busca por nome do produto
 *     responses:
 *       200:
 *         description: Lista de produtos recuperada com sucesso
 *         headers:
 *           x-total-count:
 *             schema:
 *               type: number
 *             description: Total de produtos disponíveis
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
 *                   description:
 *                     type: string
 *                   price:
 *                     type: number
 *                     format: float
 *                   image_url:
 *                     type: string
 *                     format: uri
 *                   rating:
 *                     type: number
 *                     format: float
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   specifications:
 *                     type: object
 *       400:
 *         description: Parâmetros de paginação inválidos
 */
productsRouter.get(
  "/products",
  ProductController.getAllValidation,
  ProductController.getAll,
);

/**
 * @swagger
 * /v1/products/{id}:
 *   get:
 *     summary: Obter produto por ID
 *     description: Retorna os detalhes de um produto específico
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: ID do produto
 *         example: 1
 *     responses:
 *       200:
 *         description: Produto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_product:
 *                   type: number
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 price:
 *                   type: number
 *                 image_url:
 *                   type: string
 *                 rating:
 *                   type: number
 *                 created_at:
 *                   type: string
 *                 specifications:
 *                   type: object
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "The id parameter needs to be entered"
 *       404:
 *         description: Produto não encontrado
 */
productsRouter.get(
  "/products/:id",
  ProductController.getByIdValidation,
  ProductController.getById,
);

/**
 * @swagger
 * /v1/products/{id}/categories:
 *   get:
 *     summary: Listar categorias do produto
 *     description: Retorna todas as categorias associadas a um produto
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         example: 1
 *     responses:
 *       200:
 *         description: Categorias encontradas
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
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Produto não encontrado
 */
productsRouter.get(
  "/products/:id/categories",
  ProductController.getAllCategoriesValidation,
  ProductController.getAllCategories,
);

/**
 * @swagger
 * /v1/products/{id}/comments:
 *   get:
 *     summary: Listar comentários do produto
 *     description: Retorna todos os comentários/reviews de um produto
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         example: 1
 *     responses:
 *       200:
 *         description: Comentários encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_product_comment:
 *                     type: number
 *                   user_id:
 *                     type: number
 *                   product_id:
 *                     type: number
 *                   comment:
 *                     type: string
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Produto não encontrado
 */
productsRouter.get(
  "/products/:id/comments",
  ProductController.getAllCommentsValidation,
  ProductController.getAllComments,
);

/**
 * @swagger
 * /v1/products/{id}/comments:
 *   post:
 *     summary: Criar comentário/review
 *     description: Cria um novo comentário para um produto (requer autenticação)
 *     tags: [Comments]
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
 *             required: [comment]
 *             properties:
 *               comment:
 *                 type: string
 *                 minLength: 1
 *                 example: "Produto excelente!"
 *     responses:
 *       201:
 *         description: Comentário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_product_comment:
 *                   type: number
 *                 user_id:
 *                   type: number
 *                 product_id:
 *                   type: number
 *                 comment:
 *                   type: string
 *       400:
 *         description: Dados inválidos ou ausentes
 *       401:
 *         description: Usuário não autenticado
 *       404:
 *         description: Produto não encontrado
 */
productsRouter.post(
  "/products/:id/comments",
  ensureAuthenticated,
  ProductController.addCommentValidation,
  ProductController.addComment,
);

/**
 * @swagger
 * /v1/products/{id}/comments/{comment_id}:
 *   delete:
 *     summary: Deletar comentário
 *     description: Remove um comentário do produto (requer autenticação do dono do comentário)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         example: 1
 *       - in: path
 *         name: comment_id
 *         required: true
 *         schema:
 *           type: number
 *         example: 5
 *     responses:
 *       204:
 *         description: Comentário deletado com sucesso
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Você não tem permissão para deletar este comentário
 *       404:
 *         description: Comentário não encontrado
 */
productsRouter.delete(
  "/products/:id/comments/:comment_id",
  ensureAuthenticated,
  ProductController.deleteCommentValidation,
  ProductController.deleteComment,
);

/**
 * @swagger
 * /v1/products/{id}/comments/{comment_id}:
 *   put:
 *     summary: Atualizar comentário
 *     description: Atualiza um comentário existente (requer autenticação do dono)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         example: 1
 *       - in: path
 *         name: comment_id
 *         required: true
 *         schema:
 *           type: number
 *         example: 5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [comment]
 *             properties:
 *               comment:
 *                 type: string
 *                 minLength: 1
 *                 example: "Excelente produto!"
 *     responses:
 *       200:
 *         description: Comentário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_product_comment:
 *                   type: number
 *                 user_id:
 *                   type: number
 *                 product_id:
 *                   type: number
 *                 comment:
 *                   type: string
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Você não tem permissão para editar este comentário
 *       404:
 *         description: Comentário não encontrado
 */
productsRouter.put(
  "/products/:id/comments/:comment_id",
  ensureAuthenticated,
  ProductController.updateCommentValidation,
  ProductController.updateComment,
);

/**
 * @swagger
 * /v1/products:
 *   post:
 *     summary: Criar novo produto (admin)
 *     description: Cria um novo produto no sistema (requer permissão de admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, price, image_url, rating, specifications]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 150
 *                 example: "Notebook Premium"
 *               description:
 *                 type: string
 *                 example: "Notebook de alta performance"
 *               price:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 example: 2999.99
 *               image_url:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/image.jpg"
 *               rating:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 maximum: 5
 *                 example: 4.5
 *               specifications:
 *                 type: object
 *                 example: { "processor": "Intel i7", "ram": "16GB", "storage": "512GB SSD" }
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_product:
 *                   type: number
 *                   example: 1
 *       400:
 *         description: Dados inválidos ou ausentes
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Permissão negada - Apenas admin pode criar produtos
 */
productsRouter.post(
  "/products",
  ensureAuthenticated,
  ensureAdmin,
  ProductController.createValidation,
  ProductController.create,
);

/**
 * @swagger
 * /v1/products/{id}:
 *   put:
 *     summary: Atualizar produto (admin)
 *     description: Atualiza os dados de um produto existente (requer permissão de admin)
 *     tags: [Products]
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
 *                 maxLength: 150
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *               image_url:
 *                 type: string
 *                 format: uri
 *               rating:
 *                 type: number
 *                 format: float
 *               specifications:
 *                 type: object
 *     responses:
 *       204:
 *         description: Produto atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Permissão negada - Apenas admin pode atualizar
 *       404:
 *         description: Produto não encontrado
 */
productsRouter.put(
  "/products/:id",
  ensureAuthenticated,
  ensureAdmin,
  ProductController.updateByIdValidation,
  ProductController.updateById,
);

/**
 * @swagger
 * /v1/products/{id}:
 *   delete:
 *     summary: Deletar produto (admin)
 *     description: Remove um produto do sistema (requer permissão de admin)
 *     tags: [Products]
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
 *         description: Produto deletado com sucesso
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Permissão negada - Apenas admin pode deletar
 *       404:
 *         description: Produto não encontrado
 */
productsRouter.delete(
  "/products/:id",
  ensureAuthenticated,
  ensureAdmin,
  ProductController.deleteByIdValidation,
  ProductController.deleteById,
);

/**
 * @swagger
 * /v1/products/{id}/categories:
 *   post:
 *     summary: Associar categoria ao produto (admin)
 *     description: Vincula uma categoria a um produto (requer permissão de admin)
 *     tags: [Products]
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
 *             required: [category_id]
 *             properties:
 *               category_id:
 *                 type: number
 *                 example: 3
 *     responses:
 *       201:
 *         description: Categoria associada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_product_category:
 *                   type: number
 *                 product_id:
 *                   type: number
 *                 category_id:
 *                   type: number
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Permissão negada - Apenas admin
 *       404:
 *         description: Produto ou categoria não encontrado
 */
productsRouter.post(
  "/products/:id/categories",
  ensureAuthenticated,
  ensureAdmin,
  ProductController.addCategoryValidation,
  ProductController.addCategory,
);

/**
 * @swagger
 * /v1/products/{id}/categories/{category_id}:
 *   delete:
 *     summary: Remover associação de categoria (admin)
 *     description: Desvincula uma categoria de um produto (requer permissão de admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         example: 1
 *       - in: path
 *         name: category_id
 *         required: true
 *         schema:
 *           type: number
 *         example: 3
 *     responses:
 *       204:
 *         description: Associação removida com sucesso
 *       400:
 *         description: IDs inválidos
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Permissão negada - Apenas admin
 *       404:
 *         description: Produto ou categoria não encontrado
 */
productsRouter.delete(
  "/products/:id/categories/:category_id",
  ensureAuthenticated,
  ensureAdmin,
  ProductController.deleteCategoryValidation,
  ProductController.deleteCategory,
);

export { productsRouter };
