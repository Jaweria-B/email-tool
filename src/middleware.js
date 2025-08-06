import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get session token from cookie
  const sessionToken = request.cookies.get('session_token')?.value;
  
  // Define protected routes - REMOVED '/' from here
  const protectedRoutes = ['/dashboard', '/profile'];
  const authRoutes = ['/login', '/register'];
  
  const pathname = request.nextUrl.pathname;
  
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Handle root route separately
  if (pathname === '/') {
    if (sessionToken) {
      // Authenticated users go to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      // Unauthenticated users go to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // If accessing protected route without session, redirect to login
  if (isProtectedRoute && !sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If accessing auth route with valid session, redirect to dashboard
  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only match the routes you actually want to protect
    '/',
    '/dashboard/:path*',
    '/profile/:path*', 
    '/login',
    '/register'
  ],
};