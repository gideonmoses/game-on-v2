import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase/firebase-admin';
import type { UserRecord } from 'firebase-admin/auth';
import type { FirebaseAuthError } from '@/types/firebase';

interface RegisterRequestBody {
  email: string;
  password: string;
  phone: string;
  jerseyNumber: number;
  dateOfBirth: string;
}

/**
 * User Registration API Endpoint
 * 
 * This endpoint handles new user registration with the following functionality:
 * - Validates required fields (email, password, phone, jersey number, DOB)
 * - Performs format validation for phone numbers and jersey numbers
 * - Creates a new user in Firebase Authentication
 * - Creates a corresponding user document in Firestore
 * - Sets initial user status as 'pending' for admin approval
 * 
 * @route POST /api/auth/register
 * @access Public
 * 
 * @param {Object} request.body
 * @param {string} request.body.email - User's email address
 * @param {string} request.body.password - User's password
 * @param {string} request.body.phone - 10-digit phone number
 * @param {number} request.body.jerseyNumber - Jersey number (1-99)
 * @param {string} request.body.dateOfBirth - Date of birth (YYYY-MM-DD)
 * 
 * @returns {Object} Response
 * @returns {boolean} Response.success - Indicates if registration was successful
 * @returns {string} Response.message - Success/error message
 * @returns {string} Response.uid - Created user's UID (on success)
 */
export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequestBody = await request.json();
    const { email, password, phone, jerseyNumber, dateOfBirth } = body;

    // Validate required fields
    if (!email || !password || !phone || !jerseyNumber || !dateOfBirth) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Validate jersey number
    if (jerseyNumber < 1 || jerseyNumber > 99) {
      return NextResponse.json(
        { error: 'Jersey number must be between 1 and 99' },
        { status: 400 }
      );
    }

    try {
      // Check if user already exists
      try {
        const existingUser = await auth.getUserByEmail(email);
        if (existingUser) {
          console.warn(`[Register] Attempt to register existing email: ${email}`);
          return NextResponse.json(
            { error: 'Email address is already registered' },
            { status: 409 }
          );
        }
      } catch (error) {
        const firebaseError = error as FirebaseAuthError;
        if (firebaseError.code !== 'auth/user-not-found') {
          throw error;
        }
      }

      // Create user in Firebase Auth
      const userRecord: UserRecord = await auth.createUser({
        email,
        password,
        emailVerified: false,
        phoneNumber: `+91${phone}`, // Assuming Indian phone numbers
      });

      // Create user document in Firestore
      await db.collection('users').doc(userRecord.uid).set({
        uid: userRecord.uid,
        email: userRecord.email,
        phoneNumber: phone,
        jerseyNumber,
        dateOfBirth,
        displayName: '',
        roles: ['player'],
        approvalStatus: 'pending',
        emailVerified: false,
        subscriptionStatus: 'inactive',
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        playerDetails: {
          isActive: true
        }
      });

      return NextResponse.json({
        success: true,
        message: 'User registered successfully. Waiting for admin approval.',
        uid: userRecord.uid
      });

    } catch (error) {
      const firebaseError = error as FirebaseAuthError;
      console.warn(`[Register] Firebase error for email ${email}:`, {
        code: firebaseError.code,
        message: firebaseError.message
      });
      
      switch (firebaseError.code) {
        case 'auth/email-already-exists':
          return NextResponse.json(
            { error: 'Email address is already registered' },
            { status: 409 }
          );

        case 'auth/invalid-email':
          return NextResponse.json(
            { error: 'Invalid email address' },
            { status: 400 }
          );

        case 'auth/weak-password':
          return NextResponse.json(
            { error: 'Password is too weak' },
            { status: 400 }
          );

        default:
          throw firebaseError;
      }
    }

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
} 