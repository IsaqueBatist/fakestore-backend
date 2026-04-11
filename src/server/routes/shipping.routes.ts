import { Router } from "express";
import { ShippingController } from "../controllers/shipping";

const shippingRouter = Router();

/**
 * @swagger
 * /v1/shipping/quote:
 *   post:
 *     summary: Cotar frete
 *     description: |
 *       Calcula opções de frete via Melhor Envio (Correios, Jadlog, Azul Cargo, etc).
 *       Resultados são cacheados por 30 minutos para a mesma combinação de CEP+dimensões.
 *       Valores em centavos (Integer) para evitar imprecisão de ponto flutuante.
 *     tags: [Shipping]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [from_postal_code, to_postal_code, weight, height, width, length, insurance_value_cents]
 *             properties:
 *               from_postal_code:
 *                 type: string
 *                 pattern: '^\d{8}$'
 *                 example: "01310100"
 *               to_postal_code:
 *                 type: string
 *                 pattern: '^\d{8}$'
 *                 example: "22041080"
 *               weight:
 *                 type: number
 *                 description: Peso em kg
 *                 example: 1.5
 *               height:
 *                 type: number
 *                 description: Altura em cm
 *                 example: 10
 *               width:
 *                 type: number
 *                 description: Largura em cm
 *                 example: 15
 *               length:
 *                 type: number
 *                 description: Comprimento em cm
 *                 example: 20
 *               insurance_value_cents:
 *                 type: integer
 *                 description: Valor declarado em centavos (ex: R$49,90 = 4990)
 *                 example: 4990
 *     responses:
 *       200:
 *         description: Cotações de frete
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
 *                       carrier:
 *                         type: string
 *                         example: "Correios"
 *                       service:
 *                         type: string
 *                         example: "SEDEX"
 *                       price_cents:
 *                         type: integer
 *                         example: 2490
 *                       delivery_days:
 *                         type: integer
 *                         example: 3
 *       400:
 *         description: Dados inválidos ou serviço indisponível
 */
shippingRouter.post(
  "/quote",
  ShippingController.quoteValidation,
  ShippingController.quote,
);

/**
 * @swagger
 * /v1/shipping/tracking/{code}:
 *   get:
 *     summary: Rastrear encomenda
 *     description: Rastreia uma encomenda via código de rastreio do Melhor Envio
 *     tags: [Shipping]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Código de rastreio
 *         example: "BR123456789BR"
 *     responses:
 *       200:
 *         description: Informações de rastreio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                 status:
 *                   type: string
 *                 events:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                       description:
 *                         type: string
 *                       location:
 *                         type: string
 *       400:
 *         description: Código inválido ou rastreio não encontrado
 */
shippingRouter.get(
  "/tracking/:code",
  ShippingController.trackValidation,
  ShippingController.track,
);

export { shippingRouter };
