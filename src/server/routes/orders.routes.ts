import { Router } from "express";
import { OrderController } from "../controllers/Orders";
import {
  ensureAuthenticated,
  ensureApiSecret,
  ensureIdempotency,
} from "../shared/middlewares";

const ordersRouter = Router();

/**
 * @swagger
 * /v1/orders:
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
ordersRouter.get("/", ensureAuthenticated, OrderController.getByUserId);

/**
 * @swagger
 * /v1/orders/{id}:
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
ordersRouter.get(
  "/:id",
  ensureAuthenticated,
  OrderController.getByIdValidation,
  OrderController.getById,
);

/**
 * @swagger
 * /v1/orders/from-cart:
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
ordersRouter.post(
  "/from-cart",
  ensureAuthenticated,
  ensureIdempotency,
  OrderController.create,
);

/**
 * @swagger
 * /v1/orders/{id}:
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
ordersRouter.put(
  "/:id",
  ensureAuthenticated,
  OrderController.updateByIdValidation,
  OrderController.updateById,
);

/**
 * @swagger
 * /v1/orders/{id}:
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
ordersRouter.delete(
  "/:id",
  ensureAuthenticated,
  OrderController.deleteByIdValidation,
  OrderController.deleteById,
);

/**
 * @swagger
 * /v1/orders/{orderId}/payment-confirmation:
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
ordersRouter.post(
  "/:orderId/payment-confirmation",
  ensureApiSecret,
  ensureIdempotency,
  OrderController.confirmPaymentValidation,
  OrderController.confirmPayment,
);

/**
 * @swagger
 * /v1/orders/{order_id}/items:
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
ordersRouter.get(
  "/:order_id/items",
  ensureAuthenticated,
  OrderController.getItems,
);

/**
 * @swagger
 * /v1/orders/{order_id}/items:
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
ordersRouter.post(
  "/:order_id/items",
  ensureAuthenticated,
  OrderController.addedItemValidation,
  OrderController.addItem,
);

/**
 * @swagger
 * /v1/orders/{order_id}/items/{id}:
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
ordersRouter.delete(
  "/:order_id/items/:id",
  ensureAuthenticated,
  OrderController.deleteItemValidation,
  OrderController.deleteItem,
);

/**
 * @swagger
 * /v1/orders/{order_id}/items/{id}:
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
ordersRouter.put(
  "/:order_id/items/:id",
  ensureAuthenticated,
  OrderController.updateItemValidation,
  OrderController.updateItem,
);

export { ordersRouter };
