import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase/firebase-admin';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '@/lib/firebase/firebase-config';

// Initialize Firebase client
const app = initializeApp(firebaseConfig);
const clientAuth = getAuth(app);

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    try {
      // Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(
        clientAuth,
        email,
        password
      );

      // Get the ID token
      const idToken = await userCredential.user.getIdToken();

      // Get user data from Firebase Admin
      const userRecord = await auth.getUser(userCredential.user.uid);

      return NextResponse.json({
        idToken,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          roles: userRecord.customClaims?.roles || ['player'],
          emailVerified: userRecord.emailVerified
        }
      });

    } catch (authError) {
      console.error('Login error:', authError);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Login request error:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
} 