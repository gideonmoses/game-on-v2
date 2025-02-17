import { NextResponse } from 'next/server';
import { getAuthenticatedUser, unauthorized } from '@/lib/firebase/auth';

export async function GET() {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser();

    if (!user) {
      return unauthorized();
    }

    // Return basic user info for testing
    return NextResponse.json({
      message: 'Authentication successful',
      user: {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
      }
    });
  } catch (error: unknown) {
    console.error('Test auth error:', error);
    
    if (error instanceof Error && error.message === 'No session cookie found') {
      return unauthorized();
    }

    return NextResponse.json(
      { error: 'Authentication test failed' },
      { status: 500 }
    );
  }
} 