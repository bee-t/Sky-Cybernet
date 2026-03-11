import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the session cookie
  const session = request.cookies.get('session');
  
  // Public paths that don't require authentication
  const publicPaths = ['/', '/auth/login', '/auth/signup', '/post'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  // If user is not authenticated and trying to access a protected route
  if (!session && !isPublicPath) {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // If user is authenticated and trying to access auth pages, redirect to home
  if (session && isPublicPath) {
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }
  
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - uploads (public uploads)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|uploads).*)',
  ],
};
