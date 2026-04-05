import { TFunction } from "i18next";
import type { Knex } from "knex";

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
    t: TFunction;
  }
}
