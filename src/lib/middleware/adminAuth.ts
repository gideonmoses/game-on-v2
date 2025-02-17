import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/firebase/auth';
import { roleQueries } from '@/lib/firebase/firestore';

export async function adminAuthMiddleware() {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const isAdmin = await roleQueries.hasRole(user.uid, 'admin');
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return null; // Middleware passes
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
} 