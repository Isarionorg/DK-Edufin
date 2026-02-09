import Redis from 'ioredis';
import { logger } from '../utils/logger';

// Redis client configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
};

// Create Redis client
const redis = new Redis(process.env.REDIS_URL || redisConfig);

// Event handlers
redis.on('connect', () => {
  logger.info('✅ Redis connected successfully');
});

redis.on('error', (error) => {
  logger.error('❌ Redis connection error:', error);
});

redis.on('ready', () => {
  logger.info('🚀 Redis is ready to accept commands');
});

redis.on('close', () => {
  logger.warn('⚠️ Redis connection closed');
});

redis.on('reconnecting', () => {
  logger.info('🔄 Redis reconnecting...');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await redis.quit();
  logger.info('👋 Redis disconnected');
});

// Helper functions for common Redis operations
export const cacheService = {
  /**
   * Get value from cache
   */
  async get(key: string): Promise<string | null> {
    try {
      return await redis.get(key);
    } catch (error) {
      logger.error(`Error getting key ${key} from cache:`, error);
      return null;
    }
  },

  /**
   * Set value in cache with optional expiry
   */
  async set(key: string, value: string, expiryInSeconds?: number): Promise<boolean> {
    try {
      if (expiryInSeconds) {
        await redis.setex(key, expiryInSeconds, value);
      } else {
        await redis.set(key, value);
      }
      return true;
    } catch (error) {
      logger.error(`Error setting key ${key} in cache:`, error);
      return false;
    }
  },

  /**
   * Delete key from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      logger.error(`Error deleting key ${key} from cache:`, error);
      return false;
    }
  },

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Error checking existence of key ${key}:`, error);
      return false;
    }
  },

  /**
   * Set expiry on existing key
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      await redis.expire(key, seconds);
      return true;
    } catch (error) {
      logger.error(`Error setting expiry on key ${key}:`, error);
      return false;
    }
  },

  /**
   * Increment value
   */
  async increment(key: string): Promise<number | null> {
    try {
      return await redis.incr(key);
    } catch (error) {
      logger.error(`Error incrementing key ${key}:`, error);
      return null;
    }
  },

  /**
   * Get all keys matching pattern
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      return await redis.keys(pattern);
    } catch (error) {
      logger.error(`Error getting keys with pattern ${pattern}:`, error);
      return [];
    }
  },

  /**
   * Flush all data from cache
   */
  async flushAll(): Promise<boolean> {
    try {
      await redis.flushall();
      return true;
    } catch (error) {
      logger.error('Error flushing cache:', error);
      return false;
    }
  },
};

export default redis;