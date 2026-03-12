/**
 * Health check endpoint for production monitoring
 */

import { NextResponse } from 'next/server';
import prisma from '@/app/lib/db';
import { getRedis } from '@/app/lib/cache';
import logger from '@/app/lib/logger';

export const dynamic = 'force-dynamic';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    database: {
      status: 'up' | 'down';
      responseTime?: number;
    };
    redis: {
      status: 'up' | 'down';
      responseTime?: number;
    };
  };
  version?: string;
}

async function checkDatabase(): Promise<{ status: 'up' | 'down'; responseTime?: number }> {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - start;
    return { status: 'up', responseTime };
  } catch (error) {
    logger.error('Database health check failed', error);
    return { status: 'down' };
  }
}

async function checkRedis(): Promise<{ status: 'up' | 'down'; responseTime?: number }> {
  try {
    const redis = getRedis();
    if (!redis) {
      return { status: 'down' };
    }
    const start = Date.now();
    await redis.ping();
    const responseTime = Date.now() - start;
    return { status: 'up', responseTime };
  } catch (error) {
    logger.error('Redis health check failed', error);
    return { status: 'down' };
  }
}

export async function GET() {
  try {
    const [database, redis] = await Promise.all([
      checkDatabase(),
      checkRedis(),
    ]);

    const allServicesUp = database.status === 'up' && redis.status === 'up';
    const someServicesDown = database.status === 'down' || redis.status === 'down';

    const health: HealthCheck = {
      status: allServicesUp ? 'healthy' : someServicesDown ? 'degraded' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database,
        redis,
      },
      version: process.env.npm_package_version,
    };

    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 207 : 503;

    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    logger.error('Health check failed', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 503 }
    );
  }
}
