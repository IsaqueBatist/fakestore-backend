import { Router } from "express";
import { AddressController } from "../controllers/addresses";
import { ensureAuthenticated } from "../shared/middlewares";

const addressesRouter = Router();

/**
 * @swagger
 * /v1/addresses:
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
addressesRouter.get(
  "/",
  ensureAuthenticated,
  AddressController.getAllValidation,
  AddressController.getAll,
);

/**
 * @swagger
 * /v1/addresses/{id}:
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
addressesRouter.get(
  "/:id",
  ensureAuthenticated,
  AddressController.getByIdValidation,
  AddressController.getById,
);

/**
 * @swagger
 * /v1/addresses:
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
addressesRouter.post(
  "/",
  ensureAuthenticated,
  AddressController.createValidation,
  AddressController.create,
);

/**
 * @swagger
 * /v1/addresses/{id}:
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
addressesRouter.put(
  "/:id",
  ensureAuthenticated,
  AddressController.updateByIdValidation,
  AddressController.updateById,
);

/**
 * @swagger
 * /v1/addresses/{id}:
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
addressesRouter.delete(
  "/:id",
  ensureAuthenticated,
  AddressController.deleteByIdValidation,
  AddressController.deleteById,
);

export { addressesRouter };
