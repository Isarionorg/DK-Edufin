import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import paymentRoutes from './payment.routes';
import uploadRoutes from './upload.routes';
import healthRoutes from './health.routes';

const router = Router();

// Health check route
router.use('/health', healthRoutes);

// Authentication routes
router.use('/auth', authRoutes);

// User routes
router.use('/users', userRoutes);

// Payment routes
router.use('/payment', paymentRoutes);

// Upload routes
router.use('/upload', uploadRoutes);

// Default API info
router.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    version: process.env.API_VERSION || 'v1',
    endpoints: {
      health: '/api/v1/health',
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      payment: '/api/v1/payment',
      upload: '/api/v1/upload',
    },
  });
});

export default router;