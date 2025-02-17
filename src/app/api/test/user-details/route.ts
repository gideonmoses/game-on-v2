import { NextResponse } from 'next/server';
import { getAuthenticatedUser, unauthorized } from '@/lib/firebase/auth';
import { db } from '@/lib/firebase/firebase-admin';

export async function GET() {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser();

    if (!user) {
      return unauthorized();
    }

    // Get additional user data from Firestore
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    // Return test-specific user details
    return NextResponse.json({
      message: 'Test user details retrieved successfully',
      testData: {
        auth: {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          displayName: user.displayName,
        },
        firestore: {
          role: userData?.role || 'user',
          createdAt: userData?.createdAt,
          lastLogin: new Date().toISOString(),
        },
        testInfo: {
          endpoint: '/api/test/user-details',
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
        }
      }
    });
  } catch (error) {
    console.error('Test user details error:', error);
    
    if (error instanceof Error && error.message === 'No session cookie found') {
      return unauthorized();
    }

    return NextResponse.json(
      { error: 'Test user details fetch failed' },
      { status: 500 }
    );
  }
} 