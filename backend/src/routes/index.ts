import { Router } from 'express';
import authRoutes from './auth.routes';
import studentRoutes from './student.routes';
import paymentRoutes from './payment.routes';
import uploadRoutes from './upload.routes';
import healthRoutes from './health.routes';
import collegeRoutes from './college.routes';

const router = Router();

// Health check route
router.use('/health', healthRoutes);

// Authentication routes
router.use('/auth', authRoutes);

// Student routes (was '/users', changed to '/student' for clarity)
router.use('/student', studentRoutes);

// Payment routes
router.use('/payment', paymentRoutes);

// Upload routes
router.use('/upload', uploadRoutes);

// College routes
router.use('/colleges', collegeRoutes);

router.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    version: process.env.API_VERSION || 'v1',
    endpoints: {
      health: '/api/v1/health',
      auth: '/api/v1/auth',
      student: '/api/v1/student',
      payment: '/api/v1/payment',
      upload: '/api/v1/upload',
      colleges: '/api/v1/colleges'
    },
  });
});

export default router;