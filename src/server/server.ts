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
import {
  errorMiddleware,
  Limiter,
  ensureAuthenticated,
  ensureAdmin,
  ensureTenant,
  tenantRateLimiter,
  requestLogger,
} from "./shared/middlewares";
import { swaggerSpec } from "../../docs/backend/SwaggerConfig";
import { TenantController } from "./controllers/tenants";

// Carrega variáveis do .env da raiz do projeto
dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });

const server = express();

server.set("trust proxy", 1);

server.use(helmet());

server.use(Limiter.globalLimiter);

server.use(
  cors({
    origin:
      process.env.ENABLED_CORS === "*"
        ? "*"
        : process.env.ENABLED_CORS
          ? process.env.ENABLED_CORS.split(";")
          : "*",
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-api-key",
      "x-api-secret",
      "Idempotency-Key",
      "Accept-Language",
    ],
    exposedHeaders: [
      "X-RateLimit-Limit",
      "X-RateLimit-Remaining",
      "Retry-After",
    ],
  }),
);

server.use(i18nMiddleware.handle(i18next));

// Billing webhook -- must be registered BEFORE express.json() to receive raw body
server.post(
  "/billing/webhook",
  express.raw({ type: "application/json" }),
  TenantController.billingWebhook,
);

server.use(express.json());

// Infrastructure routes -- exempt from tenant resolution and tenant rate limiting
server.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

server.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Tenant onboarding -- public, no x-api-key required
server.post(
  "/tenants/register",
  Limiter.tenantRegistrationLimiter,
  TenantController.registerValidation,
  TenantController.register,
);

// Tenant credential recovery -- JWT-authenticated, no x-api-key required (Sudo Mode)
server.post(
  "/tenants/credentials/rotate",
  Limiter.autenticationLimiter,
  ensureAuthenticated,
  ensureAdmin,
  TenantController.rotateCredentialsValidation,
  TenantController.rotateCredentials,
);

// Billing management -- JWT-authenticated, no x-api-key required
server.post(
  "/tenants/billing/checkout",
  Limiter.financeLimiter,
  ensureAuthenticated,
  ensureAdmin,
  TenantController.checkoutValidation,
  TenantController.checkout,
);

server.post(
  "/tenants/billing/portal",
  Limiter.financeLimiter,
  ensureAuthenticated,
  ensureAdmin,
  TenantController.portalValidation,
  TenantController.portal,
);

server.get(
  "/tenants/billing/verify",
  ensureAuthenticated,
  ensureAdmin,
  TenantController.verifyCheckoutValidation,
  TenantController.verifyCheckout,
);

// Business routes -- require tenant resolution via x-api-key header
server.use(ensureTenant, tenantRateLimiter, requestLogger, router);

server.use(errorMiddleware);

export { server };
