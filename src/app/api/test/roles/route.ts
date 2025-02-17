import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/firebase/auth';
import { roleQueries } from '@/lib/firebase/firestore';
import { db } from '@/lib/firebase/firebase-admin';

export async function GET() {
  try {
    // Get the authenticated user
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's roles from Firestore
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    // Ensure roles array exists
    if (!Array.isArray(userData.roles)) {
      // Update user document with default roles
      await userDoc.ref.update({
        roles: ['player'],
        updatedAt: new Date().toISOString()
      });
      userData.roles = ['player'];
    }

    // Get role assignments
    const roleAssignments = await roleQueries.getUserRoleAssignments(user.uid);

    // Check individual roles
    const isAdmin = userData.roles.includes('admin');
    const isPlayer = userData.roles.includes('player');
    const isSelector = userData.roles.includes('selector');
    const isManager = userData.roles.includes('manager');

    // Test accessing protected endpoints
    const testEndpoints = [
      {
        endpoint: '/api/users',
        hasAccess: isAdmin,
        requiredRole: 'admin'
      },
      {
        endpoint: '/api/users/roles',
        hasAccess: isAdmin,
        requiredRole: 'admin'
      }
    ];

    return NextResponse.json({
      message: 'Role test results',
      user: {
        uid: user.uid,
        email: user.email,
        roles: {
          isAdmin,
          isPlayer,
          isSelector,
          isManager
        }
      },
      roleAssignments: roleAssignments.docs.map(doc => doc.data()),
      accessTests: testEndpoints.map(test => ({
        ...test,
        result: test.hasAccess ? 'Access Granted' : 'Access Denied'
      }))
    });
  } catch (error) {
    console.error('Role test error:', error);
    return NextResponse.json(
      { error: 'Role test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 