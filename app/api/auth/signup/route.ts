import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';
import { setAuthCookie } from '@/app/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { username, displayName, password } = await request.json();

    if (!username || !displayName || !password) {
      return NextResponse.json(
        { error: 'Username, display name, and password are required' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Validate username format (lowercase letters, numbers, underscores only)
    if (!/^[a-z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: 'Username must contain only lowercase letters, numbers, and underscores' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists. Please choose another.' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await prisma.user.create({
      data: {
        username: username.toLowerCase(),
        displayName: displayName,
        password: hashedPassword,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        bio: '',
        verified: false,
      },
    });

    // Set auth cookie
    await setAuthCookie(user.username);

    return NextResponse.json({ 
      success: true, 
      username: user.username,
      displayName: user.displayName 
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}
