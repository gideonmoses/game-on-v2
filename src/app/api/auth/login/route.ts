import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/firebase-admin';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use Firebase Auth REST API for email/password sign-in
    const signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`;
    
    const response = await fetch(signInUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.warn(`[Auth] Login failed for email: ${email}, error: ${data?.error?.message}`);
      return NextResponse.json(
        { error: data?.error?.message || 'Authentication failed' },
        { status: 401 }
      );
    }

    // Check user's approval status in Firestore
    const userDoc = await db.collection('users').doc(data.localId).get();
    const userData = userDoc.data();

    if (!userData) {
      console.warn(`[Auth] User data not found for uid: ${data.localId}`);
      return NextResponse.json(
        { error: 'User account not found' },
        { status: 404 }
      );
    }

    if (userData.approvalStatus !== 'approved') {
      console.warn(`[Auth] Login attempt by unapproved user: ${data.localId}, status: ${userData.approvalStatus}`);
      return NextResponse.json(
        { error: 'Account pending approval' },
        { status: 403 }
      );
    }

    // Return the ID token for session creation
    return NextResponse.json({ 
      token: data.idToken,
      user: {
        uid: data.localId,
        email: data.email,
        approvalStatus: userData.approvalStatus,
        roles: userData.roles || ['player'],
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
} 