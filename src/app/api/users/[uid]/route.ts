import { NextResponse } from 'next/server';
import type { AuthenticatedRequest } from '@/types/auth';
import type { UserUpdateRequest } from '@/types/user';
import { UserService } from '@/lib/services/UserService';
import { withUserAccess } from '@/lib/middleware/auth/userAccess';
import { adminOnly, playerOrAdmin } from '@/lib/middleware/auth/roleAccess';
import { withValidation, userUpdateSchema } from '@/lib/middleware/validation/schemas';

type RouteParams = { params: { uid: string } };

async function getHandler(
  request: AuthenticatedRequest,
  context: RouteParams
) {
  try {
    const { user } = request;
    const { uid } = context.params;

    const userData = await UserService.getUser(uid);
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const sanitizedData = UserService.sanitizeUserData(userData, user);
    return NextResponse.json(sanitizedData);

  } catch (error) {
    console.error('User detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

async function updateHandler(
  request: AuthenticatedRequest,
  validatedData: UserUpdateRequest,
  context: RouteParams
) {
  try {
    const { uid } = context.params;
    const updatedData = await UserService.updateUser(uid, validatedData);
    const sanitizedData = UserService.sanitizeUserData(updatedData, request.user);

    return NextResponse.json(sanitizedData);

  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export const GET = playerOrAdmin(withUserAccess(getHandler));
export const PUT = adminOnly(withUserAccess(
  withValidation(userUpdateSchema, updateHandler)
)); 