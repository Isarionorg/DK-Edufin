import { Request, Response } from 'express';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin-secret-token';

export const adminLogin = (req: Request, res: Response): void => {
  const { password } = req.body;

  if (password !== ADMIN_PASSWORD) {
    res.status(401).json({ success: false, message: 'Invalid password' });
    return;
  }

  res.json({ success: true, token: ADMIN_TOKEN });
};

export const adminVerify = (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (token !== ADMIN_TOKEN) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  res.json({ success: true });
};