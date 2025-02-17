import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/firebase/firebase-admin';
import { db } from '@/lib/firebase/firebase-admin';
import { cookies } from 'next/headers';

/**
 * Session Management API
 * Public routes for handling session cookies
 */

// Session duration: 5 days
const SESSION_DURATION = 60 * 60 * 24 * 5 * 1000;

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'No ID token provided' },
        { status: 400 }
      );
    }

    try {
      // Verify the ID token
      const decodedToken = await auth.verifyIdToken(idToken);

      // Create session cookie
      const sessionCookie = await auth.createSessionCookie(idToken, {
        expiresIn: SESSION_DURATION
      });

      // Set cookie options
      const options = {
        name: 'session',
        value: sessionCookie,
        maxAge: SESSION_DURATION,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax' as const
      };

      // Set the cookie
      cookies().set(options);

      return NextResponse.json({
        status: 'success',
        user: {
          uid: decodedToken.uid,
          email: decodedToken.email,
          roles: decodedToken.roles || ['player'],
          emailVerified: decodedToken.email_verified
        }
      });

    } catch (error) {
      console.error('Session creation error:', error);
      return NextResponse.json(
        { error: 'Invalid ID token' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  try {
    const response = NextResponse.json({ status: 'success' });
    
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