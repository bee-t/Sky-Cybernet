import { cookies } from 'next/headers';
import prisma from './db';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const username = cookieStore.get('auth_username')?.value;
  
  if (!username) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatar: true,
      verified: true,
      theme: true,
    },
  });

  return user;
}

export async function setAuthCookie(username: string) {
  const cookieStore = await cookies();
  cookieStore.set('auth_username', username, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_username');
}
