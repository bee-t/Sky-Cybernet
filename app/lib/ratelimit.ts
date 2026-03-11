import { getRedis } from './cache';

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export async function rateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): Promise<RateLimitResult> {
  const redis = getRedis();
  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  try {
    // Remove old entries outside the window
    await redis.zremrangebyscore(key, 0, windowStart);

    // Count requests in current window
    const count = await redis.zcard(key);

    if (count >= maxRequests) {
      // Get the oldest entry to calculate reset time
      const oldest = await redis.zrange(key, 0, 0, 'WITHSCORES');
      const resetTime = oldest.length > 0 ? parseInt(oldest[1]) + windowMs : now + windowMs;

      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        reset: Math.ceil(resetTime / 1000),
      };
    }

    // Add current request
    await redis.zadd(key, now.toString(), `${now}:${Math.random()}`);
    await redis.expire(key, Math.ceil(windowMs / 1000));

    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - count - 1,
      reset: Math.ceil((now + windowMs) / 1000),
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    // On error, allow the request (fail open)
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests,
      reset: Math.ceil((now + windowMs) / 1000),
    };
  }
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  };
}
