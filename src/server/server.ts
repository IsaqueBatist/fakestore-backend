import "express-async-errors";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";

import { router } from "./routes";
import "./shared/services";
import { errorMiddleware, Limiter } from "./shared/middlewares";
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
    //Adicionar endereço do frontend depois
  }),
);

server.use(express.json());

server.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

server.use(router);

server.use(errorMiddleware);

export { server };
