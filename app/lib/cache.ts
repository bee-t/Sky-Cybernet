import { Redis } from 'ioredis';

let redis: Redis | null = null;
let connectionAttempted = false;

export function getRedis(): Redis | null {
  // Only use Redis in production or if explicitly enabled
  if (process.env.NODE_ENV !== 'production' && !process.env.REDIS_URL) {
    return null;
  }

  if (!redis && !connectionAttempted) {
    connectionAttempted = true;
    try {
      redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
        maxRetriesPerRequest: 1,
        enableReadyCheck: false,
        enableOfflineQueue: false,
        lazyConnect: true,
        retryStrategy() {
          // Don't retry - fail fast
          return null;
        },
      });

      redis.on('error', () => {
        // Silently fail - Redis is optional for development
        redis = null;
      });

      redis.on('connect', () => {
        console.log('✅ Redis connected');
      });

      // Try to connect
      redis.connect().catch(() => {
        redis = null;
      });
    } catch (error) {
      redis = null;
    }
  }

  return redis;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const client = getRedis();
    if (!client) return null;
    
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    // Silently fail - caching is optional
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number = 60
): Promise<void> {
  try {
    const client = getRedis();
    if (!client) return;
    
    await client.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    // Silently fail - caching is optional
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    const client = getRedis();
    if (!client) return;
    
    await client.del(key);
  } catch (error) {
    // Silently fail - caching is optional
  }
}

export async function cacheInvalidatePattern(pattern: string): Promise<void> {
  try {
    const client = getRedis();
    if (!client) return;
    
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch (error) {
    // Silently fail - caching is optional
  }
}
