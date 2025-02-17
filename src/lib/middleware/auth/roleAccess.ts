import { NextResponse } from 'next/server';
import type { AuthenticatedRequest } from '@/types/auth';
import type { UserRole } from '@/types/user';

type RouteParams = { params: { uid: string } };

type RouteHandler = (
  request: AuthenticatedRequest, 
  context: RouteParams
) => Promise<NextResponse>;

export function withRoles(handler: RouteHandler, allowedRoles: UserRole[]) {
  return async (request: AuthenticatedRequest, context: RouteParams) => {
    const { user } = request;
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const hasRequiredRole = allowedRoles.some(role => 
      user.roles.includes(role)
    );

    if (!hasRequiredRole) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return handler(request, context);
  };
}

export function adminOnly(handler: RouteHandler) {
  return withRoles(handler, ['admin']);
}

export function playerOrAdmin(handler: RouteHandler) {
  return withRoles(handler, ['admin', 'player']);
} 