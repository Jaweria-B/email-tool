import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get session token from cookie
  const sessionToken = request.cookies.get('session_token')?.value;
  
  // Define protected routes
  const protectedRoutes = ['/dashboard', '/profile', '/'];
  const authRoutes = ['/login', '/register'];
  
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  
  const isAuthRoute = authRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

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
    '/((?!api|_next/static|_next/image|favicon|.*\\.png$).*)',
  ],
};