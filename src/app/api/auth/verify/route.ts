/**
 * Auth Verification API
 * 
 * Internal API route to verify session and user status
 * Used by client-side middleware for auth checks
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/firebase/firebase-admin';
import { db } from '@/lib/firebase/firebase-admin';
import type { FirebaseAuthError } from '@/types/firebase';

export async function POST(request: NextRequest) {
  try {
    const { sessionCookie } = await request.json();

    if (!sessionCookie) {
      return NextResponse.json({ 
        valid: false,
        error: 'No session cookie provided'
      }, { status: 401 });
    }

    try {
      // Verify the session cookie
      const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
      
      // Get user data from Firestore
      const userDoc = await db.collection('users').doc(decodedClaims.uid).get();
      const userData = userDoc.data();

      if (!userData) {
        console.warn(`[Verify] User data not found for uid: ${decodedClaims.uid}`);
        return NextResponse.json({ 
          valid: false,
          error: 'User not found'
        }, { status: 404 });
      }

      if (userData.approvalStatus !== 'approved') {
        console.warn(`[Verify] Session verification attempt by unapproved user: ${decodedClaims.uid}, status: ${userData.approvalStatus}`);
        return NextResponse.json({ 
          valid: false,
          error: 'Account pending approval'
        }, { status: 403 });
      }

      return NextResponse.json({
        valid: true,
        user: {
          ...userData,
          uid: decodedClaims.uid,
          email: decodedClaims.email,
        }
      });

    } catch (error) {
      const firebaseError = error as FirebaseAuthError;
      console.warn('[Verify] Session verification failed:', {
        code: firebaseError.code,
        message: firebaseError.message
      });

      switch (firebaseError.code) {
        case 'auth/session-cookie-expired':
          return NextResponse.json({ 
            valid: false,
            error: 'Session expired'
          }, { status: 401 });

        case 'auth/invalid-session-cookie':
        case 'auth/argument-error':
          return NextResponse.json({ 
            valid: false,
            error: 'Invalid session format'
          }, { status: 401 });

        default:
          return NextResponse.json({ 
            valid: false,
            error: 'Session verification failed'
          }, { status: 401 });
      }
    }

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ 
      valid: false,
      error: 'Invalid request'
    }, { status: 400 });
  }
} 