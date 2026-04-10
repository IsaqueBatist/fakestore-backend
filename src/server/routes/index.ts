import { Router } from "express";
import { ProductController, UserController } from "../controllers";
import { OrderController } from "../controllers/Orders";
import { AddressController } from "../controllers/addresses";
import { CartController } from "../controllers/carts";
import { CategoryController } from "../controllers/categories";
import { TenantController } from "../controllers/tenants";
import {
  ensureAdmin,
  ensureApiSecret,
  ensureAuthenticated,
  ensureIdempotency,
  Limiter,
} from "../shared/middlewares";
import { AIController } from "../controllers/ai";
import { WebhookController } from "../controllers/webhooks";
import { AnalyticsController } from "../controllers/analytics";
import { LogController } from "../controllers/logs";
import { UsageController } from "../controllers/usage";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Operações de autenticação e recuperação de senha
 *   - name: Products
 *     description: Gerenciamento de produtos
 *   - name: Categories
 *     description: Categorias
 *   - name: Comments
 *     description: Comentários
 *   - name: Orders
 *     description: Pedidos
 *   - name: Cart
 *     description: Carrinho
 *   - name: Addresses
 *     description: Endereços
 *   - name: Favorites
 *     description: Favoritos
 *   - name: AI
 *     description: Assistente de IA para integração com a API (SDK Dinâmico)
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login - Autenticar usuário
 *     description: Realiza login do usuário e retorna um JWT token de acesso
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password_hash:
 *                 type: string
 *                 minLength: 6
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Erro de validação - Email ou senha inválidos/ausentes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Este campo é obrigatório"
 *                 errors:
 *                   type: object
 *       401:
 *         description: Email ou senha incorretos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Incorrect email or password"
 *       429:
 *         description: Muitas tentativas de login - Rate limit atingido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Você fez muitas tentativas de login. Tente novamente mais tarde."
 */
router.post(
  "/login",
  Limiter.autenticationLimiter,
  UserController.signInValidation,
  UserController.signIn,
);

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Registro - Criar nova conta de usuário
 *     description: Cria uma nova conta de usuário com validação de dados e verifica email duplicado
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password_hash]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 example: "João Silva"
 *               email:
 *                 type: string
 *                 format: email
 *                 minLength: 5
 *                 example: "joao@example.com"
 *               password_hash:
 *                 type: string
 *                 minLength: 6
 *                 example: "senha123456"
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: number
 *                   example: 1
 *       400:
 *         description: Erro de validação - Dados inválidos ou faltando
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: object
 *       409:
 *         description: Email já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Este email já está registrado"
 *       429:
 *         description: Muitas tentativas de registro - Rate limit atingido
 */
router.post(
  "/register",
  Limiter.autenticationLimiter,
  UserController.signUpValidation,
  UserController.signUp,
);

/**
 * @swagger
 * /forgot-password:
 *   post:
 *     summary: Recuperação de senha - Solicitar reset
 *     description: Envia um token de reset de senha para o email do usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Email de reset enviado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email de reset de senha enviado"
 *       400:
 *         description: Email inválido ou ausente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Email não encontrado no sistema
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       429:
 *         description: Muitas tentativas - Rate limit atingido
 */
router.post(
  "/forgot-password",
  Limiter.autenticationLimiter,
  UserController.forgotPasswordValidation,
  UserController.forgotPassword,
);

/**
 * @swagger
 * /reset-password:
 *   post:
 *     summary: Reset de senha - Confirmar nova senha
 *     description: Redefine a senha do usuário usando o token de reset recebido por email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token:
 *                 type: string
 *                 example: "abc123def456..."
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: "novaSenha123"
 *     responses:
 *       204:
 *         description: Senha redefinida com sucesso
 *       400:
 *         description: Dados inválidos ou token ausente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Token expirado ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       429:
 *         description: Muitas tentativas - Rate limit atingido
 */
router.post(
  "/reset-password",
  Limiter.autenticationLimiter,
  UserController.resetPasswordValidation,
  UserController.resetPassword,
);

/**
 * @swagger
 * /products:
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
router.get(
  "/products",
  ProductController.getAllValidation,
  ProductController.getAll,
);

/**
 * @swagger
 * /products/{id}:
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
router.get(
  "/products/:id",
  ProductController.getByIdValidation,
  ProductController.getById,
);

/**
 * @swagger
 * /products/{id}/categories:
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
router.get(
  "/products/:id/categories",
  ProductController.getAllCategoriesValidation,
  ProductController.getAllCategories,
);

/**
 * @swagger
 * /products/{id}/comments:
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
router.get(
  "/products/:id/comments",
  ProductController.getAllCommentsValidation,
  ProductController.getAllComments,
);

/**
 * @swagger
 * /categories:
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
router.get(
  "/categories",
  CategoryController.getAllValidation,
  CategoryController.getAll,
);

/**
 * @swagger
 * /categories/{id}:
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
router.get(
  "/categories/:id",
  CategoryController.getByIdValidation,
  CategoryController.getById,
);

/**
 * @swagger
 * /products/{id}/comments:
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
router.post(
  "/products/:id/comments",
  ensureAuthenticated,
  ProductController.addCommentValidation,
  ProductController.addComment,
);

/**
 * @swagger
 * /products/{id}/comments/{comment_id}:
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
router.delete(
  "/products/:id/comments/:comment_id",
  ensureAuthenticated,
  ProductController.deleteCommentValidation,
  ProductController.deleteComment,
);

/**
 * @swagger
 * /products/{id}/comments/{comment_id}:
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
router.put(
  "/products/:id/comments/:comment_id",
  ensureAuthenticated,
  ProductController.updateCommentValidation,
  ProductController.updateComment,
);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Listar pedidos do usuário
 *     description: Retorna todos os pedidos do usuário autenticado
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pedidos recuperados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_order:
 *                     type: number
 *                   user_id:
 *                     type: number
 *                   total:
 *                     type: number
 *                     format: float
 *                   status:
 *                     type: string
 *                     example: "pending"
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Usuário não autenticado
 */
router.get("/orders", ensureAuthenticated, OrderController.getByUserId);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Obter pedido por ID
 *     description: Retorna os detalhes de um pedido específico (requer autenticação)
 *     tags: [Orders]
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
 *       200:
 *         description: Pedido encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_order:
 *                   type: number
 *                 user_id:
 *                   type: number
 *                 total:
 *                   type: number
 *                 status:
 *                   type: string
 *                 created_at:
 *                   type: string
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Você não tem permissão para acessar este pedido
 *       404:
 *         description: Pedido não encontrado
 */
router.get(
  "/orders/:id",
  ensureAuthenticated,
  OrderController.getByIdValidation,
  OrderController.getById,
);

/**
 * @swagger
 * /orders/from-cart:
 *   post:
 *     summary: Criar pedido a partir do carrinho
 *     description: Cria um novo pedido usando os itens do carrinho do usuário
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 newOrderId:
 *                   type: number
 *                   example: 1
 *       400:
 *         description: Carrinho vazio ou dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       500:
 *         description: Erro ao processar pedido
 */
router.post(
  "/orders/from-cart",
  ensureAuthenticated,
  ensureIdempotency,
  OrderController.create,
);

/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     summary: Atualizar pedido
 *     description: Atualiza os dados de um pedido (requer autenticação)
 *     tags: [Orders]
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
 *               status:
 *                 type: string
 *                 example: "shipped"
 *               total:
 *                 type: number
 *     responses:
 *       204:
 *         description: Pedido atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Você não tem permissão para atualizar este pedido
 *       404:
 *         description: Pedido não encontrado
 */
router.put(
  "/orders/:id",
  ensureAuthenticated,
  OrderController.updateByIdValidation,
  OrderController.updateById,
);

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Deletar pedido
 *     description: Remove um pedido do sistema (requer autenticação)
 *     tags: [Orders]
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
 *         description: Pedido deletado com sucesso
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Você não tem permissão para deletar este pedido
 *       404:
 *         description: Pedido não encontrado
 */
router.delete(
  "/orders/:id",
  ensureAuthenticated,
  OrderController.deleteByIdValidation,
  OrderController.deleteById,
);

/**
 * @swagger
 * /orders/{orderId}/payment-confirmation:
 *   post:
 *     summary: Confirmar pagamento de pedido
 *     description: |
 *       Endpoint S2S (Server-to-Server) para confirmar o pagamento de um pedido.
 *       Utilizado pelo gateway de pagamento ou backend da agência cliente para
 *       transicionar o status do pedido de "pending" para "paid".
 *       Requer autenticação via API Key + API Secret e header de idempotência.
 *     tags: [Orders]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: number
 *         description: ID do pedido a confirmar pagamento
 *         example: 1
 *       - in: header
 *         name: x-api-secret
 *         required: true
 *         schema:
 *           type: string
 *         description: Segredo da API para autenticação S2S
 *       - in: header
 *         name: Idempotency-Key
 *         required: true
 *         schema:
 *           type: string
 *         description: Chave de idempotência para evitar processamento duplicado
 *         example: "pay_abc123_unique"
 *     responses:
 *       200:
 *         description: Pagamento confirmado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 order_id:
 *                   type: number
 *                   example: 1
 *                 status:
 *                   type: string
 *                   example: "paid"
 *       400:
 *         description: ID inválido ou header Idempotency-Key ausente
 *       401:
 *         description: API Key ou API Secret inválidos
 *       404:
 *         description: Pedido não encontrado
 *       409:
 *         description: Pedido não está no status "pending" (já processado ou cancelado)
 */
router.post(
  "/orders/:orderId/payment-confirmation",
  ensureApiSecret,
  ensureIdempotency,
  OrderController.confirmPaymentValidation,
  OrderController.confirmPayment,
);

/**
 * @swagger
 * /orders/{order_id}/items:
 *   get:
 *     summary: Listar itens do pedido
 *     description: Retorna todos os itens de um pedido específico
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: number
 *         example: 1
 *     responses:
 *       200:
 *         description: Itens do pedido recuperados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_order_item:
 *                     type: number
 *                   order_id:
 *                     type: number
 *                   product_id:
 *                     type: number
 *                   quantity:
 *                     type: number
 *                   unt_price:
 *                     type: number
 *       401:
 *         description: Usuário não autenticado
 *       404:
 *         description: Pedido não encontrado
 */
router.get(
  "/orders/:order_id/items",
  ensureAuthenticated,
  OrderController.getItems,
);

/**
 * @swagger
 * /orders/{order_id}/items:
 *   post:
 *     summary: Adicionar item ao pedido
 *     description: Adiciona um novo item/produto ao pedido
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: order_id
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
 *             required: [product_id, quantity, unt_price]
 *             properties:
 *               product_id:
 *                 type: number
 *                 example: 5
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *                 example: 2
 *               unt_price:
 *                 type: number
 *                 format: float
 *                 example: 99.99
 *     responses:
 *       201:
 *         description: Item adicionado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_order_item:
 *                   type: number
 *                 order_id:
 *                   type: number
 *                 product_id:
 *                   type: number
 *                 quantity:
 *                   type: number
 *                 unt_price:
 *                   type: number
 *       400:
 *         description: Dados inválidos - quantidade ou preço inválido
 *       401:
 *         description: Usuário não autenticado
 *       404:
 *         description: Pedido ou produto não encontrado
 */
router.post(
  "/orders/:order_id/items",
  ensureAuthenticated,
  OrderController.addedItemValidation,
  OrderController.addItem,
);

/**
 * @swagger
 * /orders/{order_id}/items/{id}:
 *   delete:
 *     summary: Remover item do pedido
 *     description: Remove um item do pedido
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: number
 *         example: 1
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         example: 3
 *     responses:
 *       204:
 *         description: Item removido com sucesso
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Usuário não autenticado
 *       404:
 *         description: Item ou pedido não encontrado
 */
router.delete(
  "/orders/:order_id/items/:id",
  ensureAuthenticated,
  OrderController.deleteItemValidation,
  OrderController.deleteItem,
);

/**
 * @swagger
 * /orders/{order_id}/items/{id}:
 *   put:
 *     summary: Atualizar item do pedido
 *     description: Atualiza quantidade e preço de um item do pedido
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: number
 *         example: 1
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         example: 3
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *                 example: 3
 *               unt_price:
 *                 type: number
 *                 format: float
 *                 example: 89.99
 *     responses:
 *       200:
 *         description: Item atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_order_item:
 *                   type: number
 *                 order_id:
 *                   type: number
 *                 product_id:
 *                   type: number
 *                 quantity:
 *                   type: number
 *                 unt_price:
 *                   type: number
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       404:
 *         description: Item ou pedido não encontrado
 */
router.put(
  "/orders/:order_id/items/:id",
  ensureAuthenticated,
  OrderController.updateItemValidation,
  OrderController.updateItem,
);

/**
 * @swagger
 * /carts:
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
router.get("/carts", ensureAuthenticated, CartController.getByUserId);

/**
 * @swagger
 * /carts/items:
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
router.post(
  "/carts/items",
  ensureAuthenticated,
  CartController.addedItemValidation,
  CartController.addItem,
);

/**
 * @swagger
 * /carts/items:
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
router.get("/carts/items", ensureAuthenticated, CartController.getItem);

/**
 * @swagger
 * /carts/items/{id}:
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
router.put(
  "/carts/items/:id",
  ensureAuthenticated,
  CartController.updateByIdValidation,
  CartController.updateById,
);

/**
 * @swagger
 * /carts/items/{id}:
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
router.delete(
  "/carts/items/:id",
  ensureAuthenticated,
  CartController.deleteItemValidation,
  CartController.deleteItem,
);

/**
 * @swagger
 * /carts:
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
router.delete("/carts", ensureAuthenticated, CartController.cleanCart);

/**
 * @swagger
 * /addresses:
 *   get:
 *     summary: Listar endereços
 *     description: Retorna todos os endereços cadastrados do usuário
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Endereços recuperados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_address:
 *                     type: number
 *                   user_id:
 *                     type: number
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zip_code:
 *                     type: string
 *                   country:
 *                     type: string
 *       401:
 *         description: Usuário não autenticado
 */
router.get(
  "/addresses",
  ensureAuthenticated,
  AddressController.getAllValidation,
  AddressController.getAll,
);

/**
 * @swagger
 * /addresses/{id}:
 *   get:
 *     summary: Obter endereço por ID
 *     description: Retorna os detalhes de um endereço específico
 *     tags: [Addresses]
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
 *       200:
 *         description: Endereço encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_address:
 *                   type: number
 *                 user_id:
 *                   type: number
 *                 street:
 *                   type: string
 *                 city:
 *                   type: string
 *                 state:
 *                   type: string
 *                 zip_code:
 *                   type: string
 *                 country:
 *                   type: string
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Usuário não autenticado
 *       404:
 *         description: Endereço não encontrado
 */
router.get(
  "/addresses/:id",
  ensureAuthenticated,
  AddressController.getByIdValidation,
  AddressController.getById,
);

/**
 * @swagger
 * /addresses:
 *   post:
 *     summary: Criar novo endereço
 *     description: Cadastra um novo endereço para o usuário
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [street, city, state, zip_code, country]
 *             properties:
 *               street:
 *                 type: string
 *                 example: "Rua A, 123"
 *               city:
 *                 type: string
 *                 example: "São Paulo"
 *               state:
 *                 type: string
 *                 example: "SP"
 *               zip_code:
 *                 type: string
 *                 pattern: "^\\d{5}-?\\d{3}$"
 *                 example: "01234-567"
 *               country:
 *                 type: string
 *                 example: "Brasil"
 *     responses:
 *       201:
 *         description: Endereço criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_address:
 *                   type: number
 *                   example: 1
 *       400:
 *         description: Dados inválidos ou ausentes - CEP inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: object
 *       401:
 *         description: Usuário não autenticado
 */
router.post(
  "/addresses",
  ensureAuthenticated,
  AddressController.createValidation,
  AddressController.create,
);

/**
 * @swagger
 * /addresses/{id}:
 *   put:
 *     summary: Atualizar endereço
 *     description: Atualiza os dados de um endereço existente
 *     tags: [Addresses]
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
 *               street:
 *                 type: string
 *                 example: "Rua B, 456"
 *               city:
 *                 type: string
 *                 example: "Rio de Janeiro"
 *               state:
 *                 type: string
 *                 example: "RJ"
 *               zip_code:
 *                 type: string
 *                 pattern: "^\\d{5}-?\\d{3}$"
 *                 example: "20000-000"
 *               country:
 *                 type: string
 *                 example: "Brasil"
 *     responses:
 *       200:
 *         description: Endereço atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_address:
 *                   type: number
 *                 user_id:
 *                   type: number
 *                 street:
 *                   type: string
 *                 city:
 *                   type: string
 *                 state:
 *                   type: string
 *                 zip_code:
 *                   type: string
 *                 country:
 *                   type: string
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Você não tem permissão para atualizar este endereço
 *       404:
 *         description: Endereço não encontrado
 */
router.put(
  "/addresses/:id",
  ensureAuthenticated,
  AddressController.updateByIdValidation,
  AddressController.updateById,
);

/**
 * @swagger
 * /addresses/{id}:
 *   delete:
 *     summary: Deletar endereço
 *     description: Remove um endereço cadastrado do usuário
 *     tags: [Addresses]
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
 *         description: Endereço deletado com sucesso
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Você não tem permissão para deletar este endereço
 *       404:
 *         description: Endereço não encontrado
 */
router.delete(
  "/addresses/:id",
  ensureAuthenticated,
  AddressController.deleteByIdValidation,
  AddressController.deleteById,
);

/**
 * @swagger
 * /favorites:
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
router.get("/favorites", ensureAuthenticated, UserController.getFavorites);

/**
 * @swagger
 * /favorites:
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
router.post(
  "/favorites",
  ensureAuthenticated,
  UserController.addFavoriteValidation,
  UserController.addFavorite,
);

/**
 * @swagger
 * /favorites/{id}:
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
router.delete(
  "/favorites/:id",
  ensureAuthenticated,
  UserController.deleteFavoriteValidation,
  UserController.deleteFavorite,
);

/**
 * @swagger
 * /products:
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
router.post(
  "/products",
  ensureAuthenticated,
  ensureAdmin,
  ProductController.createValidation,
  ProductController.create,
);

/**
 * @swagger
 * /products/{id}:
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
router.put(
  "/products/:id",
  ensureAuthenticated,
  ensureAdmin,
  ProductController.updateByIdValidation,
  ProductController.updateById,
);

/**
 * @swagger
 * /products/{id}:
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
router.delete(
  "/products/:id",
  ensureAuthenticated,
  ensureAdmin,
  ProductController.deleteByIdValidation,
  ProductController.deleteById,
);

/**
 * @swagger
 * /products/{id}/categories:
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
router.post(
  "/products/:id/categories",
  ensureAuthenticated,
  ensureAdmin,
  ProductController.addCategoryValidation,
  ProductController.addCategory,
);

/**
 * @swagger
 * /products/{id}/categories/{category_id}:
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
router.delete(
  "/products/:id/categories/:category_id",
  ensureAuthenticated,
  ensureAdmin,
  ProductController.deleteCategoryValidation,
  ProductController.deleteCategory,
);

/**
 * @swagger
 * /categories:
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
router.post(
  "/categories",
  ensureAuthenticated,
  ensureAdmin,
  CategoryController.createValidation,
  CategoryController.create,
);

/**
 * @swagger
 * /categories/{id}:
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
router.put(
  "/categories/:id",
  ensureAuthenticated,
  ensureAdmin,
  CategoryController.updateByIdValidation,
  CategoryController.updateById,
);

/**
 * @swagger
 * /categories/{id}:
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
router.delete(
  "/categories/:id",
  ensureAuthenticated,
  ensureAdmin,
  CategoryController.deleteByIdValidation,
  CategoryController.deleteById,
);

/**
 * @swagger
 * /ai/ask:
 *   post:
 *     summary: Perguntar ao assistente de IA sobre a API (SDK Dinâmico)
 *     description: |
 *       Envia uma pergunta técnica sobre a FakeStore API e recebe uma resposta
 *       gerada por IA com snippets de código baseados na documentação OpenAPI.
 *       Requer autenticação Server-to-Server (API Key + API Secret).
 *     tags: [AI]
 *     security: []
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 *         description: Chave de API do tenant
 *       - in: header
 *         name: x-api-secret
 *         required: true
 *         schema:
 *           type: string
 *         description: Secret de API do tenant (autenticação S2S)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question]
 *             properties:
 *               question:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 500
 *                 example: "How do I list all products with pagination?"
 *     responses:
 *       200:
 *         description: Resposta da IA
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 answer:
 *                   type: string
 *       400:
 *         description: Pergunta inválida
 *       401:
 *         description: API Key ou API Secret ausente/inválido
 *       429:
 *         description: Cota de IA excedida para este tenant
 *       503:
 *         description: Serviço de IA temporariamente indisponível
 */
router.post(
  "/ai/ask",
  ensureApiSecret,
  Limiter.aiLimiter,
  AIController.askValidation,
  AIController.ask,
);

// Tenant key rotation -- requires both x-api-key and x-api-secret
router.post(
  "/tenants/rotate-keys",
  ensureApiSecret,
  TenantController.rotateKeys,
);

// ============================================================================
// Usage Stats (Admin)
// ============================================================================

router.get(
  "/tenant/usage",
  ensureAuthenticated,
  ensureAdmin,
  UsageController.getUsage,
);

// ============================================================================
// API Request Logs (Admin)
// ============================================================================

router.get(
  "/tenant/logs",
  ensureAuthenticated,
  ensureAdmin,
  LogController.listLogsValidation,
  LogController.listLogs,
);

// ============================================================================
// Analytics (Admin)
// ============================================================================

router.get(
  "/tenant/metrics/overview",
  ensureAuthenticated,
  ensureAdmin,
  AnalyticsController.overviewValidation,
  AnalyticsController.overview,
);

router.get(
  "/tenant/metrics/funnel",
  ensureAuthenticated,
  ensureAdmin,
  AnalyticsController.funnel,
);

// ============================================================================
// Webhook Event Management (Admin)
// ============================================================================

router.get(
  "/webhooks/events",
  ensureAuthenticated,
  ensureAdmin,
  WebhookController.listEventsValidation,
  WebhookController.listEvents,
);

router.post(
  "/webhooks/events/:id/replay",
  ensureAuthenticated,
  ensureAdmin,
  WebhookController.replayEventValidation,
  WebhookController.replayEvent,
);

export { router };
