import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

// Prisma Client singleton
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Connect to database
export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Disconnect from database
export const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect();
    logger.info('👋 Database disconnected');
  } catch (error) {
    logger.error('Error disconnecting from database:', error);
  }
};

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await disconnectDatabase();
});

export default prisma;