import { TFunction } from "i18next";
import type { Knex } from "knex";

export interface PendingWebhook {
  tenantId: number;
  event: string;
  payload: object;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: number;
      role: string;
    };
    tenant?: {
      id: number;
      plan: string;
      rateLimit: number;
    };
    getTenantTrx?: () => Promise<Knex.Transaction>;
    pendingWebhooks: PendingWebhook[];
    t: TFunction;
  }
}
