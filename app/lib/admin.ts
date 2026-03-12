/**
 * Admin authorization utilities
 */

import { getCurrentUser } from './auth';

export async function requireAdmin() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized: No user session');
  }

  // Check if user is admin from database
  const prisma = (await import('./db')).default;
  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (fullUser?.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required');
  }

  return user;
}

export async function isAdmin(): Promise<boolean> {
  try {
    await requireAdmin();
    return true;
  } catch {
    return false;
  }
}
