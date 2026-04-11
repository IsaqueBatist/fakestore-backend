import { Router } from "express";
import { CouponController } from "../controllers/coupons";
import { ensureAuthenticated, ensureAdmin } from "../shared/middlewares";

const couponsRouter = Router();

/**
 * @swagger
 * /v1/coupons:
 *   get:
 *     summary: Listar cupons (admin)
 *     description: Retorna lista de todos os cupons do tenant
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filtrar por status ativo/inativo
 *     responses:
 *       200:
 *         description: Cupons recuperados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_coupon:
 *                     type: number
 *                   code:
 *                     type: string
 *                   discount_type:
 *                     type: string
 *                     enum: [percentage, fixed]
 *                   discount_value_cents:
 *                     type: integer
 *                   min_order_cents:
 *                     type: integer
 *                   max_uses:
 *                     type: integer
 *                     nullable: true
 *                   current_uses:
 *                     type: integer
 *                   active:
 *                     type: boolean
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Permissão negada - Apenas admin
 */
couponsRouter.get(
  "/coupons",
  ensureAuthenticated,
  ensureAdmin,
  CouponController.getAllValidation,
  CouponController.getAll,
);

/**
 * @swagger
 * /v1/coupons:
 *   post:
 *     summary: Criar novo cupom (admin)
 *     description: Cria um novo cupom de desconto (requer permissão de admin). Valores monetários em centavos.
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, discount_type, discount_value_cents]
 *             properties:
 *               code:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: "WELCOME10"
 *               discount_type:
 *                 type: string
 *                 enum: [percentage, fixed]
 *                 example: "percentage"
 *               discount_value_cents:
 *                 type: integer
 *                 description: "Para percentage: basis points (1500 = 15%). Para fixed: centavos (1000 = R$10,00)"
 *                 example: 1500
 *               min_order_cents:
 *                 type: integer
 *                 description: "Valor mínimo do pedido em centavos"
 *                 example: 5000
 *               max_uses:
 *                 type: integer
 *                 nullable: true
 *                 description: "Número máximo de usos (null = ilimitado)"
 *                 example: 100
 *               starts_at:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               expires_at:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Cupom criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: number
 *               description: ID do cupom criado
 *       400:
 *         description: Dados inválidos ou ausentes
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Permissão negada - Apenas admin
 */
couponsRouter.post(
  "/coupons",
  ensureAuthenticated,
  ensureAdmin,
  CouponController.createValidation,
  CouponController.create,
);

/**
 * @swagger
 * /v1/coupons/validate:
 *   post:
 *     summary: Validar cupom e calcular desconto
 *     description: Valida um cupom e retorna o valor do desconto calculado. Requer autenticação.
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, order_total_cents]
 *             properties:
 *               code:
 *                 type: string
 *                 example: "WELCOME10"
 *               order_total_cents:
 *                 type: integer
 *                 description: "Total do pedido em centavos"
 *                 example: 10000
 *     responses:
 *       200:
 *         description: Cupom validado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 discount_cents:
 *                   type: integer
 *                 final_total_cents:
 *                   type: integer
 *                 coupon:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                     discount_type:
 *                       type: string
 *                     discount_value_cents:
 *                       type: integer
 *       400:
 *         description: Cupom inválido, expirado ou requisitos não atendidos
 *       401:
 *         description: Usuário não autenticado
 *       404:
 *         description: Cupom não encontrado
 */
couponsRouter.post(
  "/coupons/validate",
  ensureAuthenticated,
  CouponController.validateValidation,
  CouponController.validate,
);

/**
 * @swagger
 * /v1/coupons/{id}:
 *   put:
 *     summary: Atualizar cupom (admin)
 *     description: Atualiza os dados de um cupom existente (requer permissão de admin)
 *     tags: [Coupons]
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
 *               code:
 *                 type: string
 *               discount_type:
 *                 type: string
 *                 enum: [percentage, fixed]
 *               discount_value_cents:
 *                 type: integer
 *               min_order_cents:
 *                 type: integer
 *               max_uses:
 *                 type: integer
 *                 nullable: true
 *               starts_at:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               expires_at:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               active:
 *                 type: boolean
 *     responses:
 *       204:
 *         description: Cupom atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Permissão negada - Apenas admin
 *       404:
 *         description: Cupom não encontrado
 */
couponsRouter.put(
  "/coupons/:id",
  ensureAuthenticated,
  ensureAdmin,
  CouponController.updateByIdValidation,
  CouponController.updateById,
);

/**
 * @swagger
 * /v1/coupons/{id}:
 *   delete:
 *     summary: Deletar cupom (admin)
 *     description: Remove um cupom do sistema (requer permissão de admin)
 *     tags: [Coupons]
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
 *         description: Cupom deletado com sucesso
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Permissão negada - Apenas admin
 *       404:
 *         description: Cupom não encontrado
 */
couponsRouter.delete(
  "/coupons/:id",
  ensureAuthenticated,
  ensureAdmin,
  CouponController.deleteByIdValidation,
  CouponController.deleteById,
);

export { couponsRouter };
