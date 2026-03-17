import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');

  // 1. Redirect to dashboard if logged in and on login/landing
  if (token && (isAuthPage || request.nextUrl.pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 2. Protected Routes (Require Login)
  // Dashboard and Opportunities are now OPEN (Guest Mode)
  // Only highly personal routes are protected
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/tracker') || 
                          request.nextUrl.pathname.startsWith('/settings') ||
                          request.nextUrl.pathname.startsWith('/profile');

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // 3. Optional: Add a header to signal "Guest" mode to the frontend
  const response = NextResponse.next();
  if (!token) {
    response.cookies.set('isGuest', 'true', { path: '/', httpOnly: false });
  } else {
    response.cookies.delete('isGuest');
  }

  return response;
}

export const config = {
  matcher: [
    '/login',
    '/dashboard/:path*',
    '/tracker/:path*',
    '/opportunities/:path*'
  ],
};
