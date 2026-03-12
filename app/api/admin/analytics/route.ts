/**
 * Admin analytics API endpoint
 * GET /api/admin/analytics
 */

import { NextResponse } from 'next/server';
import prisma from '@/app/lib/db';
import { requireAdmin } from '@/app/lib/admin';
import logger from '@/app/lib/logger';

export const dynamic = 'force-dynamic';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalPosts: number;
    totalReactions: number;
    activeUsersToday: number;
    activeUsersWeek: number;
  };
  userGrowth: {
    date: string;
    count: number;
  }[];
  postActivity: {
    date: string;
    count: number;
  }[];
  topLocations: {
    location: string;
    count: number;
  }[];
  usersByDate: {
    date: string;
    newUsers: number;
    activeUsers: number;
  }[];
}

export async function GET() {
  try {
    await requireAdmin();

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Overview statistics
    const [
      totalUsers,
      totalPosts,
      totalReactions,
      activeUsersToday,
      activeUsersWeek,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.reaction.count(),
      prisma.user.count({
        where: {
          lastActive: {
            gte: oneDayAgo,
          },
        },
      }),
      prisma.user.count({
        where: {
          lastActive: {
            gte: oneWeekAgo,
          },
        },
      }),
    ]);

    // User growth over last 30 days
    const userGrowthData = await prisma.user.groupBy({
      by: ['createdAt'],
      _count: true,
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const userGrowth = userGrowthData.map((item) => ({
      date: item.createdAt.toISOString().split('T')[0],
      count: item._count,
    }));

    // Post activity over last 30 days
    const postActivityData = await prisma.post.groupBy({
      by: ['createdAt'],
      _count: true,
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const postActivity = postActivityData.map((item) => ({
      date: item.createdAt.toISOString().split('T')[0],
      count: item._count,
    }));

    // Top locations
    const topLocationsData = await prisma.user.groupBy({
      by: ['location'],
      _count: true,
      where: {
        location: {
          not: null,
        },
      },
      orderBy: {
        _count: {
          location: 'desc',
        },
      },
      take: 10,
    });

    const topLocations = topLocationsData.map((item) => ({
      location: item.location || 'Unknown',
      count: item._count,
    }));

    // Aggregate user growth and activity by date
    const usersByDateMap = new Map<string, { newUsers: number; activeUsers: number }>();
    
    // Get new users per day
    const newUsersByDate = await prisma.user.groupBy({
      by: ['createdAt'],
      _count: true,
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    newUsersByDate.forEach((item) => {
      const date = item.createdAt.toISOString().split('T')[0];
      usersByDateMap.set(date, {
        newUsers: item._count,
        activeUsers: usersByDateMap.get(date)?.activeUsers || 0,
      });
    });

    const usersByDate = Array.from(usersByDateMap.entries())
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const analytics: AnalyticsData = {
      overview: {
        totalUsers,
        totalPosts,
        totalReactions,
        activeUsersToday,
        activeUsersWeek,
      },
      userGrowth,
      postActivity,
      topLocations,
      usersByDate,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    logger.error('Admin analytics failed', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
