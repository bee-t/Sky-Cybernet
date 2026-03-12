import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/lib/auth';
import prisma from '@/app/lib/db';

/**
 * Update user theme preference
 */
export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { theme } = body;

    // Validate theme value
    if (!theme || !['green', 'orange'].includes(theme)) {
      return NextResponse.json(
        { error: 'Invalid theme. Must be "green" or "orange"' },
        { status: 400 }
      );
    }

    // Update user's theme preference
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { theme },
    });

    return NextResponse.json({ 
      success: true,
      theme 
    });
  } catch (error) {
    console.error('Error updating theme:', error);
    return NextResponse.json(
      { error: 'Failed to update theme' },
      { status: 500 }
    );
  }
}
