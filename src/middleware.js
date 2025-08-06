import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get session token from cookie
  const sessionToken = request.cookies.get('session_token')?.value;
  
  // Define protected routes (only dashboard and profile require auth)
  const protectedRoutes = ['/dashboard', '/profile'];
  const authRoutes = ['/login', '/register'];
  
  const pathname = request.nextUrl.pathname;
  
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Root route is now public - no redirect needed
  // Users can access / without authentication
  
  // If accessing protected route without session, redirect to login
  if (isProtectedRoute && !sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If accessing auth route with valid session, redirect to home page (/)
  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Remove '/' from matcher since it's now public
    '/dashboard/:path*',
    '/profile/:path*', 
    '/login',
    '/register'
  ],
};