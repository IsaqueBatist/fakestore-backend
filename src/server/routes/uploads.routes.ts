import { Router } from "express";
import { UploadController } from "../controllers/uploads";
import { ensureAuthenticated } from "../shared/middlewares";

const uploadsRouter = Router();

/**
 * @swagger
 * /v1/uploads/presign:
 *   post:
 *     summary: Gerar URL de upload presigned
 *     description: |
 *       Gera uma URL temporária (5 minutos) para upload direto ao Cloudflare R2.
 *       O binário NUNCA passa pelo backend — o cliente faz PUT direto na URL retornada.
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [filename, mime_type]
 *             properties:
 *               filename:
 *                 type: string
 *                 example: "product-photo.jpg"
 *               mime_type:
 *                 type: string
 *                 enum: [image/jpeg, image/png, image/webp, image/avif]
 *                 example: "image/jpeg"
 *     responses:
 *       200:
 *         description: URL de upload gerada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uploadUrl:
 *                   type: string
 *                   description: URL presigned para fazer PUT do arquivo
 *                 objectKey:
 *                   type: string
 *                   description: Chave do objeto no R2 (salvar no campo image_url do produto)
 *                 publicUrl:
 *                   type: string
 *                   description: URL pública do arquivo após upload
 *       400:
 *         description: Dados inválidos (filename ou mime_type)
 *       401:
 *         description: Usuário não autenticado
 */
uploadsRouter.post(
  "/presign",
  ensureAuthenticated,
  UploadController.presignValidation,
  UploadController.presign,
);

export { uploadsRouter };
