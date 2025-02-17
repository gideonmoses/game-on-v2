import { NextResponse } from 'next/server';
import type { AuthenticatedRequest } from '@/types/auth';
import { migrateUserRoles } from '@/lib/firebase/migrations';

/**
 * Role Migration API
 * Protected by middleware - admin only
 */
export async function POST(request: AuthenticatedRequest) {
  try {
    // Middleware has already verified admin access
    await migrateUserRoles();

    return NextResponse.json({
      success: true,
      message: 'User roles migration completed'
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed' },
      { status: 500 }
    );
  }
} 