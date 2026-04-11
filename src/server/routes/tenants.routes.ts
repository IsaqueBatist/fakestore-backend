import { Router } from "express";
import { TenantController } from "../controllers/tenants";
import { ensureApiSecret } from "../shared/middlewares";

const tenantsRouter = Router();

/**
 * @swagger
 * /v1/tenants/rotate-keys:
 *   post:
 *     summary: Rotacionar chaves da API do tenant
 *     description: |
 *       Rotaciona as chaves de API (api_key e api_secret) do tenant autenticado.
 *       Requer autenticação Server-to-Server via x-api-key + x-api-secret.
 *     tags: [Tenants]
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
 *     responses:
 *       200:
 *         description: Chaves rotacionadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 api_key:
 *                   type: string
 *                 api_secret:
 *                   type: string
 *       401:
 *         description: API Key ou API Secret ausente/inválido
 */
tenantsRouter.post(
  "/rotate-keys",
  ensureApiSecret,
  TenantController.rotateKeys,
);

export { tenantsRouter };
