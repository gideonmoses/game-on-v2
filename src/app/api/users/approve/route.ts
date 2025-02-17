import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/firebase/auth';
import { roleQueries, userQueries } from '@/lib/firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    // Get the admin user
    const adminUser = await getAuthenticatedUser();
    
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify admin role
    const isAdmin = await roleQueries.hasRole(adminUser.uid, 'admin');
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only administrators can approve users' },
        { status: 403 }
      );
    }

    // Get request body
    const body = await request.json();
    const { userId, action, reason } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      await userQueries.approveUser(userId, adminUser.uid);
    } else if (action === 'reject') {
      await userQueries.rejectUser(userId, adminUser.uid, reason);
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User ${action}d successfully`
    });
  } catch (error) {
    console.error('User approval error:', error);
    return NextResponse.json(
      { error: 'Failed to process user approval' },
      { status: 500 }
    );
  }
} 