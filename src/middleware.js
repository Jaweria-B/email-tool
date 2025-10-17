import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();

  // Get session token from cookie
  const sessionToken = request.cookies.get('session_token')?.value;

  // Define protected routes
  const protectedRoutes = ['/dashboard', '/profile'];
  const authRoutes = ['/login', '/register'];

  const pathname = request.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  const isAuthRoute = authRoutes.some(route =>
    pathname.startsWith(route)
  );

  // If accessing protected route without session, redirect to login
  if (isProtectedRoute && !sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If accessing auth route with valid session, redirect to home page
  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};