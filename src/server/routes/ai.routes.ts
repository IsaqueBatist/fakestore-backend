import { Router } from "express";
import { AIController } from "../controllers/ai";
import { ensureApiSecret, Limiter } from "../shared/middlewares";

const aiRouter = Router();

/**
 * @swagger
 * /v1/ai/ask:
 *   post:
 *     summary: Perguntar ao assistente de IA sobre a API (SDK Dinamico)
 *     description: |
 *       Envia uma pergunta tecnica sobre a FakeStore API e recebe uma resposta
 *       gerada por IA com snippets de codigo baseados na documentacao OpenAPI.
 *       Requer autenticacao Server-to-Server (API Key + API Secret).
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
 *         description: Secret de API do tenant (autenticacao S2S)
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
 *         description: Pergunta invalida
 *       401:
 *         description: API Key ou API Secret ausente/invalido
 *       429:
 *         description: Cota de IA excedida para este tenant
 *       503:
 *         description: Servico de IA temporariamente indisponivel
 */
aiRouter.post(
  "/ask",
  ensureApiSecret,
  Limiter.aiLimiter,
  AIController.askValidation,
  AIController.ask,
);

export { aiRouter };
