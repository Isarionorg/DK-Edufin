import dotenv from 'dotenv';
import app from './app';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Server instance
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
  logger.info(`📡 API Version: ${process.env.API_VERSION || 'v1'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    logger.info('💥 Process terminated!');
  });
});

// Keep-alive ping for Render (prevents sleeping)
if (process.env.NODE_ENV === 'production' && process.env.RENDER_EXTERNAL_URL) {
  const keepAliveInterval = parseInt(process.env.KEEP_ALIVE_INTERVAL || '840000', 10);
  
  setInterval(() => {
    fetch(`${process.env.RENDER_EXTERNAL_URL}/api/v1/health`)
      .then(() => logger.info('Keep-alive ping successful'))
      .catch((err) => logger.error('Keep-alive ping failed:', err));
  }, keepAliveInterval);
  
  logger.info(`🔄 Keep-alive enabled (interval: ${keepAliveInterval}ms)`);
}

export default server;