import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequestWithAuth } from 'next-auth/middleware';

// Public paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/forgot-password',
  '/reset-password',
  '/error',
  '/api/auth',
  '/api/webhooks',
];

// Paths that are always accessible (static files, etc.)
const alwaysAccessiblePaths = [
  '/_next',
  '/favicon.ico',
  '/images',
  '/fonts',
  '/api/health',
];

export default async function middleware(request: NextRequestWithAuth) {
  const { pathname } = request.nextUrl;

  // Check if the path is always accessible
  if (alwaysAccessiblePaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if the path is public
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Get the token from the request
  const token = await getToken({ req: request });

  // If there's no token, redirect to login
  if (!token) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.url;
    const url = new URL('/login', baseUrl);
    // Use the actual request URL as the callback URL, but ensure it's relative
    const callbackUrl = new URL(request.url);
    callbackUrl.search = ''; // Remove any existing query parameters
    url.searchParams.set('callbackUrl', callbackUrl.pathname);
    return NextResponse.redirect(url);
  }

  // User is authenticated, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 