import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/firebase/firebase-admin';
import { db } from '@/lib/firebase/firebase-admin';

/**
 * Session Management API
 * Public routes for handling session cookies
 */
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    // Verify the ID token first
    try {
      const decodedToken = await auth.verifyIdToken(token);
      
      // Check user's approval status in Firestore
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();
      const userData = userDoc.data();

      if (!userData) {
        console.warn(`[Session] User data not found for uid: ${decodedToken.uid}`);
        return NextResponse.json(
          { error: 'User account not found' },
          { status: 404 }
        );
      }

      if (userData.approvalStatus !== 'approved') {
        console.warn(`[Session] Session creation attempt by unapproved user: ${decodedToken.uid}, status: ${userData.approvalStatus}`);
        return NextResponse.json(
          { error: 'Account pending approval' },
          { status: 403 }
        );
      }

      // Create session cookie
      const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
      const sessionCookie = await auth.createSessionCookie(token, { expiresIn });

      // Create response with session cookie
      const response = NextResponse.json({ 
        status: 'success',
        user: {
          uid: decodedToken.uid,
          email: decodedToken.email,
          approvalStatus: userData.approvalStatus,
          roles: userData.roles || ['player'],
        }
      });

      // Set cookie in response
      response.cookies.set('session', sessionCookie, {
        maxAge: expiresIn / 1000, // Convert to seconds
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      });

      return response;

    } catch (tokenError) {
      console.warn('[Session] Token verification failed:', tokenError);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
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