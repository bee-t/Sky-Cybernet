import Redis from 'ioredis';

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
        enableOfflineQueue: false,
        retryStrategy() {
          // Don't retry - fail fast
          return null;
        },
        lazyConnect: true,
      });

      redis.on('error', (err) => {
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

// Cache helpers
export async function getCached<T>(key: string): Promise<T | null> {
  const client = getRedis();
  if (!client) return null;

  try {
    const cached = await client.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function setCached<T>(
  key: string,
  value: T,
  expirationSeconds: number = 60
): Promise<void> {
  const client = getRedis();
  if (!client) return;

  try {
    await client.setex(key, expirationSeconds, JSON.stringify(value));
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  const client = getRedis();
  if (!client) return;

  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

// Rate limiting helpers
export async function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): Promise<{ allowed: boolean; remaining: number }> {
  const client = getRedis();
  
  // If Redis is not available, allow all requests (fail open)
  if (!client) {
    return { allowed: true, remaining: maxRequests };
  }

  const key = `rate_limit:${identifier}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  try {
    // Remove old entries
    await client.zremrangebyscore(key, 0, windowStart);

    // Count current requests
    const currentRequests = await client.zcard(key);

    if (currentRequests >= maxRequests) {
      return { allowed: false, remaining: 0 };
    }

    // Add current request
    await client.zadd(key, now, `${now}`);
    await client.expire(key, Math.ceil(windowMs / 1000));

    return {
      allowed: true,
      remaining: maxRequests - (currentRequests + 1),
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    // Fail open - allow request if rate limiting fails
    return { allowed: true, remaining: maxRequests };
  }
}
