// import Redis from 'ioredis';
// import { logger } from '../utils/logger';

// // Redis client configuration
// const redisConfig = {
//   host: process.env.REDIS_HOST || 'localhost',
//   port: parseInt(process.env.REDIS_PORT || '6379', 10),
//   password: process.env.REDIS_PASSWORD || undefined,
//   retryStrategy: (times: number) => {
//     const delay = Math.min(times * 50, 2000);
//     return delay;
//   },
//   maxRetriesPerRequest: 3,
//   // Don't throw on connection errors during startup
//   lazyConnect: true,
//   enableReadyCheck: false,
//   enableOfflineQueue: false,
// };

// // Create Redis client
// // const redis = new Redis(process.env.REDIS_URL || redisConfig);
// let redisAvailable = false;

// // Event handlers
// redis.on('connect', () => {
//   redisAvailable = true;
//   logger.info('✅ Redis connected successfully');
// });

// redis.on('error', (error) => {
//   redisAvailable = false;
//   logger.warn('⚠️ Redis unavailable - app will work without caching:', error.message);
// });

// redis.on('ready', () => {
//   logger.info('🚀 Redis is ready to accept commands');
// });

// redis.on('close', () => {
//   redisAvailable = false;
//   logger.warn('⚠️ Redis connection closed');
// });

// redis.on('reconnecting', () => {
//   logger.info('🔄 Redis reconnecting...');
// });

// // Graceful shutdown
// process.on('SIGTERM', async () => {
//   try {
//     await redis.quit();
//     logger.info('👋 Redis disconnected');
//   } catch (error) {
//     logger.warn('Redis was not connected');
//   }
// });

// // Helper functions for common Redis operations
// export const cacheService = {
//   /**
//    * Get value from cache
//    */
//   async get(key: string): Promise<any> {
//     try {
//       if (!redisAvailable) return null;
//       const value = await redis.get(key);
//       return value ? JSON.parse(value) : null;
//     } catch (error) {
//       logger.warn(`Cache get error for key ${key}:`, error);
//       return null;
//     }
//   },

//   /**
//    * Set value in cache with optional expiration
//    */
//   async set(key: string, value: any, expiresIn?: number): Promise<void> {
//     try {
//       if (!redisAvailable) return;
//       const serialized = JSON.stringify(value);
//       if (expiresIn) {
//         await redis.setex(key, expiresIn, serialized);
//       } else {
//         await redis.set(key, serialized);
//       }
//     } catch (error) {
//       logger.warn(`Cache set error for key ${key}:`, error);
//     }
//   },

//   /**
//    * Delete value from cache
//    */
//   async delete(key: string): Promise<void> {
//     try {
//       if (!redisAvailable) return;
//       await redis.del(key);
//     } catch (error) {
//       logger.warn(`Cache delete error for key ${key}:`, error);
//     }
//   },

//   /**
//    * Clear all cache
//    */
//   async clear(): Promise<void> {
//     try {
//       if (!redisAvailable) return;
//       await redis.flushall();
//     } catch (error) {
//       logger.warn('Cache clear error:', error);
//     }
//   },

//   /**
//    * Check if Redis is available
//    */
//   isAvailable(): boolean {
//     return redisAvailable;
//   },

//   /**
//    * Check if key exists
//    */
//   async exists(key: string): Promise<boolean> {
//     try {
//       if (!redisAvailable) return false;
//       const result = await redis.exists(key);
//       return result === 1;
//     } catch (error) {
//       logger.warn(`Cache exists error for key ${key}:`, error);
//       return false;
//     }
//   },

//   /**
//    * Set expiry on key
//    */
//   async expire(key: string, seconds: number): Promise<void> {
//     try {
//       if (!redisAvailable) return;
//       await redis.expire(key, seconds);
//     } catch (error) {
//       logger.warn(`Cache expire error for key ${key}:`, error);
//     }
//   },

//   /**
//    * Increment value
//    */
//   async increment(key: string): Promise<number | null> {
//     try {
//       if (!redisAvailable) return null;
//       return await redis.incr(key);
//     } catch (error) {
//       logger.warn(`Cache increment error for key ${key}:`, error);
//       return null;
//     }
//   },
// };

// export default redis;

// redis.ts - add this one line at the very bottom
export {};