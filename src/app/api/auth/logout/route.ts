import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase/firebase-admin';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // Get the session cookie
    const sessionCookie = cookies().get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { message: 'Already logged out' },
        { status: 200 }
      );
    }

    // Verify and revoke the session
    try {
      const decodedClaims = await auth.verifySessionCookie(sessionCookie);
      await auth.revokeRefreshTokens(decodedClaims.sub);
    } catch (error) {
      console.error('Session verification error:', error);
      // Continue with cookie removal even if verification fails
    }

    // Create response
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );

    // Clear the session cookie
    response.cookies.set('session', '', {
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
} 