import { Router } from "express";
import { WebhookController } from "../controllers/webhooks";
import { ensureAuthenticated, ensureAdmin } from "../shared/middlewares";

const webhooksRouter = Router();

/**
 * @swagger
 * /v1/webhooks/events:
 *   get:
 *     summary: Listar eventos de webhook do tenant
 *     description: |
 *       Retorna os eventos de webhook disparados pelo tenant com suporte
 *       a paginação e filtros. Requer autenticação e permissão de admin.
 *     tags: [Webhooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Cursor opaco para paginação
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Itens por página (padrão 20)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, delivered, failed]
 *         description: Filtro por status do evento
 *       - in: query
 *         name: event_type
 *         schema:
 *           type: string
 *         description: Filtro por tipo de evento (ex. order.created, product.updated)
 *     responses:
 *       200:
 *         description: Eventos de webhook recuperados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       event_type:
 *                         type: string
 *                       status:
 *                         type: string
 *                       payload:
 *                         type: object
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 cursor:
 *                   type: string
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Permissão negada - Apenas admin
 */
webhooksRouter.get(
  "/events",
  ensureAuthenticated,
  ensureAdmin,
  WebhookController.listEventsValidation,
  WebhookController.listEvents,
);

/**
 * @swagger
 * /v1/webhooks/events/{id}/replay:
 *   post:
 *     summary: Reenviar evento de webhook
 *     description: |
 *       Reenvia um evento de webhook específico para o endpoint configurado
 *       do tenant. Útil para reprocessar eventos que falharam.
 *       Requer autenticação e permissão de admin.
 *     tags: [Webhooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: ID do evento de webhook
 *         example: 1
 *     responses:
 *       200:
 *         description: Evento reenviado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Event replayed successfully"
 *                 status:
 *                   type: string
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Permissão negada - Apenas admin
 *       404:
 *         description: Evento não encontrado
 */
webhooksRouter.post(
  "/events/:id/replay",
  ensureAuthenticated,
  ensureAdmin,
  WebhookController.replayEventValidation,
  WebhookController.replayEvent,
);

export { webhooksRouter };
