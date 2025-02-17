import { NextResponse } from 'next/server';
import type { AuthenticatedRequest } from '@/types/auth';
import { UserService } from '@/lib/services/UserService';

type RouteParams = { params: { uid: string } };

type RouteHandler = (
  request: AuthenticatedRequest, 
  params: RouteParams
) => Promise<NextResponse>;

export function withUserAccess(handler: RouteHandler) {
  return async (request: AuthenticatedRequest, context: RouteParams) => {
    const { user } = request;
    const { uid } = context.params;

    const canAccess = await UserService.canAccessUser(user, uid);
    if (!canAccess) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return handler(request, context);
  };
} 