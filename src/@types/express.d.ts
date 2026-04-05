import { TFunction } from "i18next";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: number;
      role: string;
    };
    t: TFunction;
  }
}
