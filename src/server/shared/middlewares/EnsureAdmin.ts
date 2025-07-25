import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

export const ensureAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(StatusCodes.FORBIDDEN).json({ error: 'Access denied: Admins only.' });
  }

  return next();
};
