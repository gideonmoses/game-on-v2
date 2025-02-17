import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isPublicRoute, getRouteProtection } from '@/config/routes';

// Paths that don't require authentication
const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/firebase-login',
  '/api/auth/session',
  '/api/auth/verify'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth check for public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Get session cookie
  const sessionCookie = request.cookies.get('session')?.value;

  if (!sessionCookie) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Verify session
  const verifyResponse = await fetch(`${request.nextUrl.origin}/api/auth/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionCookie })
  });

  if (!verifyResponse.ok) {
    return NextResponse.json(
      { error: 'Invalid session' },
      { status: 401 }
    );
  }

  const { valid, user, error } = await verifyResponse.json();

  if (!valid) {
    console.warn(`[Unauthorized] Invalid session - Path: ${pathname}, Error: ${error}, IP: ${request.ip}`);
    return NextResponse.json(
      { error: 'Invalid session' },
      { status: 401 }
    );
  }

  // Get route protection requirements
  const routeProtection = getRouteProtection(pathname);

  if (routeProtection) {
    // Check role requirements
    if (routeProtection.roles && 
        !routeProtection.roles.some(role => user.roles.includes(role))) {
      console.warn(`[Forbidden] Insufficient permissions - Path: ${pathname}, User: ${user.uid}, Required Roles: ${routeProtection.roles.join(', ')}, User Roles: ${user.roles.join(', ')}`);
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Check approval status for protected routes
    if (routeProtection.requireAuth && user.approvalStatus !== 'approved') {
      console.warn(`[Forbidden] Account not approved - Path: ${pathname}, User: ${user.uid}, Status: ${user.approvalStatus}`);
      return NextResponse.json(
        { error: 'Account pending approval' },
        { status: 403 }
      );
    }
  }

  // Clone the request headers and add the user info
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', user.uid);
  requestHeaders.set('x-user-roles', JSON.stringify(user.roles));
  requestHeaders.set('x-user-email', user.email);

  // Return response with modified headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Configure which routes use this middleware
export const config = {
  matcher: '/api/:path*',
}; 