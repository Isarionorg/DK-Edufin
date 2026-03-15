import { Router, Request, Response } from 'express';
import prisma from '../config/database';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    services: {
      database: 'unknown',
      redis: 'disabled',  // ✅ redis is not configured
    },
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    healthCheck.services.database = 'connected';
  } catch (error) {
    healthCheck.services.database = 'disconnected';
    healthCheck.status = 'degraded';
  }

  const statusCode = healthCheck.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

router.get('/simple', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

export default router;