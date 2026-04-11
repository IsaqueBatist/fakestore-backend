import { Router } from "express";
import { UserController } from "../controllers";
import { Limiter } from "../shared/middlewares";

const authRouter = Router();

/**
 * @swagger
 * /v1/login:
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
authRouter.post(
  "/login",
  Limiter.autenticationLimiter,
  UserController.signInValidation,
  UserController.signIn,
);

/**
 * @swagger
 * /v1/register:
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
authRouter.post(
  "/register",
  Limiter.autenticationLimiter,
  UserController.signUpValidation,
  UserController.signUp,
);

/**
 * @swagger
 * /v1/forgot-password:
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
authRouter.post(
  "/forgot-password",
  Limiter.autenticationLimiter,
  UserController.forgotPasswordValidation,
  UserController.forgotPassword,
);

/**
 * @swagger
 * /v1/reset-password:
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
authRouter.post(
  "/reset-password",
  Limiter.autenticationLimiter,
  UserController.resetPasswordValidation,
  UserController.resetPassword,
);

export { authRouter };
