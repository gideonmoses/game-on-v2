import { NextResponse } from 'next/server';
import type { AuthenticatedRequest } from '@/types/auth';
import { RoleService } from '@/lib/firebase/roles';

/**
 * User Role Management API
 * Protected by middleware - admin only
 */
export async function POST(request: AuthenticatedRequest) {
  try {
    // Middleware has already verified admin access
    const adminUser = request.user;

    // Validate request body
    const body = await request.json();
    const { userId, roles } = body;

    if (!userId || !Array.isArray(roles) || roles.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Assign roles
    const result = await RoleService.assignRoles({
      userId,
      roles,
      assignedBy: adminUser.uid,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Role assignment error:', error);
    return NextResponse.json(
      { error: 'Failed to assign roles' },
      { status: 500 }
    );
  }
} 