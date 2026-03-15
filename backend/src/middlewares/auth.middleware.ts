import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    (req as any).user = decoded;
    return next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Alias for convenience
export const authenticate = authenticateToken;