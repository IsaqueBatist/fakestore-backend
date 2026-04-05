import "express-async-errors";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";

import { router } from "./routes";
import "./shared/services";
import { i18next, i18nMiddleware } from "./shared/i18n";
import { errorMiddleware, Limiter, ensureTenant, tenantRateLimiter } from "./shared/middlewares";
import { swaggerSpec } from "../../docs/backend/SwaggerConfig";

// Carrega variáveis do .env da raiz do projeto
dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });

const server = express();

server.set("trust proxy", 1);

server.use(helmet());

server.use(Limiter.globalLimiter);

server.use(
  cors({
    origin: process.env.ENABLED_CORS
      ? process.env.ENABLED_CORS.split(";")
      : "*",
  }),
);

server.use(i18nMiddleware.handle(i18next));

server.use(express.json());

// Infrastructure routes -- exempt from tenant resolution and tenant rate limiting
server.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

server.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Business routes -- require tenant resolution via x-api-key header
server.use(ensureTenant, tenantRateLimiter, router);

server.use(errorMiddleware);

export { server };
