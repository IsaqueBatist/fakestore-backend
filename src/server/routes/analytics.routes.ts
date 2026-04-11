import { Router } from "express";
import { AnalyticsController } from "../controllers/analytics";
import { LogController } from "../controllers/logs";
import { UsageController } from "../controllers/usage";
import { ensureAuthenticated, ensureAdmin } from "../shared/middlewares";

const analyticsRouter = Router();

/**
 * @swagger
 * /v1/tenant/usage:
 *   get:
 *     summary: Obter estatísticas de uso do tenant
 *     description: |
 *       Retorna as estatísticas de uso da API do tenant, incluindo
 *       contagem de requisições, usuários ativos e consumo de recursos.
 *       Requer autenticação e permissão de admin.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas de uso recuperadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 requests:
 *                   type: number
 *                 users:
 *                   type: number
 *                 products:
 *                   type: number
 *                 orders:
 *                   type: number
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Permissão negada - Apenas admin
 */
analyticsRouter.get(
  "/tenant/usage",
  ensureAuthenticated,
  ensureAdmin,
  UsageController.getUsage,
);

/**
 * @swagger
 * /v1/tenant/logs:
 *   get:
 *     summary: Listar logs de requisições da API
 *     description: |
 *       Retorna os logs de requisições feitas à API do tenant com suporte
 *       a paginação e filtros. Requer autenticação e permissão de admin.
 *     tags: [Analytics]
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
 *         name: method
 *         schema:
 *           type: string
 *         description: Filtro por método HTTP (GET, POST, PUT, DELETE)
 *       - in: query
 *         name: status
 *         schema:
 *           type: number
 *         description: Filtro por status code HTTP
 *       - in: query
 *         name: path
 *         schema:
 *           type: string
 *         description: Filtro por caminho da requisição
 *     responses:
 *       200:
 *         description: Logs de requisições recuperados com sucesso
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
 *                       method:
 *                         type: string
 *                       path:
 *                         type: string
 *                       status_code:
 *                         type: number
 *                       response_time_ms:
 *                         type: number
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
analyticsRouter.get(
  "/tenant/logs",
  ensureAuthenticated,
  ensureAdmin,
  LogController.listLogsValidation,
  LogController.listLogs,
);

/**
 * @swagger
 * /v1/tenant/metrics/overview:
 *   get:
 *     summary: Obter visão geral de métricas do tenant
 *     description: |
 *       Retorna métricas agregadas do tenant, incluindo receita, pedidos,
 *       taxa de conversão e tendências. Requer autenticação e permissão de admin.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d]
 *         description: Período de análise
 *     responses:
 *       200:
 *         description: Métricas recuperadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 revenue:
 *                   type: number
 *                 orders:
 *                   type: number
 *                 average_order_value:
 *                   type: number
 *                 conversion_rate:
 *                   type: number
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Permissão negada - Apenas admin
 */
analyticsRouter.get(
  "/tenant/metrics/overview",
  ensureAuthenticated,
  ensureAdmin,
  AnalyticsController.overviewValidation,
  AnalyticsController.overview,
);

/**
 * @swagger
 * /v1/tenant/metrics/funnel:
 *   get:
 *     summary: Obter funil de conversão do tenant
 *     description: |
 *       Retorna dados do funil de conversão do tenant (visualizações,
 *       adição ao carrinho, checkout, pagamento). Requer autenticação e permissão de admin.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do funil recuperados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 views:
 *                   type: number
 *                 add_to_cart:
 *                   type: number
 *                 checkout:
 *                   type: number
 *                 payment:
 *                   type: number
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Permissão negada - Apenas admin
 */
analyticsRouter.get(
  "/tenant/metrics/funnel",
  ensureAuthenticated,
  ensureAdmin,
  AnalyticsController.funnel,
);

export { analyticsRouter };
