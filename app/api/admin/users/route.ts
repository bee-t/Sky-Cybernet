/**
 * Admin users management API
 * GET /api/admin/users - List all users with pagination
 * PATCH /api/admin/users/:id - Update user (role, verified status)
 * DELETE /api/admin/users/:id - Delete user
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';
import { requireAdmin } from '@/app/lib/admin';
import logger from '@/app/lib/logger';
import { Prisma } from '@/app/generated/prisma/client';

export const dynamic = 'force-dynamic';

// GET - List all users with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || 'all';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { username: { contains: search } },
        { displayName: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (role !== 'all') {
      where.role = role.toUpperCase() as 'USER' | 'ADMIN';
    }

    // Get total count
    const total = await prisma.user.count({ where });

    // Get users
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        role: true,
        verified: true,
        location: true,
        avatar: true,
        createdAt: true,
        lastActive: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        [sortBy]: order,
      },
    });

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Admin users list failed', error);

    if (error instanceof Error) {
      if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }

    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
