import { Request, Response, NextFunction } from 'express';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin-secret-token';

export const requireAdminAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (token !== ADMIN_TOKEN) {
    res.status(401).json({ success: false, message: 'Admin access required' });
    return;
  }

  next();
};