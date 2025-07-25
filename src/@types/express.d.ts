import { Request } from 'express';

  declare module 'express-serve-static-core' {
    interface Request {
      user?: {
        id: number
      }; // Or a more specific type for your user object
    }
  }