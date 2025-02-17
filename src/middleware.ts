import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isPublicRoute, getRouteProtection } from '@/config/routes';

export async function middleware(request: NextRequest) {
  const { pathname } = new URL(request.url);

  // Skip middleware for public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('session')?.value;

  if (!sessionCookie) {
    console.warn(`[Unauthorized] No session cookie - Path: ${pathname}, IP: ${request.ip}, User-Agent: ${request.headers.get('user-agent')}`);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Verify session using our API route
  const verifyResponse = await fetch(`${request.nextUrl.origin}/api/auth/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionCookie }),
  });

  const { valid, user, error } = await verifyResponse.json();

  if (!valid) {
    console.warn(`[Unauthorized] Invalid session - Path: ${pathname}, Error: ${error}, IP: ${request.ip}`);
    return NextResponse.json(
      { error: error || 'Unauthorized' },
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

  // Add user info to headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', user.uid);
  requestHeaders.set('x-user-roles', JSON.stringify(user.roles));

  // Return modified request
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 