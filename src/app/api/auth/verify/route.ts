/**
 * Auth Verification API
 * 
 * Internal API route to verify session and user status
 * Used by client-side middleware for auth checks
 */
import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase/firebase-admin';

export async function POST(request: Request) {
  try {
    const { sessionCookie } = await request.json();

    if (!sessionCookie) {
      return NextResponse.json({
        valid: false,
        error: 'No session cookie provided'
      }, { status: 401 });
    }

    try {
      const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
      return NextResponse.json({
        valid: true,
        user: {
          uid: decodedClaims.uid,
          email: decodedClaims.email,
          roles: decodedClaims.roles || ['player'],
          emailVerified: decodedClaims.email_verified
        }
      });
    } catch (error) {
      return NextResponse.json({
        valid: false,
        error: 'Invalid session'
      }, { status: 401 });
    }

  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json({
      valid: false,
      error: 'Invalid request'
    }, { status: 400 });
  }
} 