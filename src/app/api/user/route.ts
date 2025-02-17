import { NextResponse } from 'next/server';
import type { AuthenticatedRequest } from '@/types/auth';

/**
 * User Profile Management API
 * 
 * Handles user profile operations:
 * - GET: Retrieves authenticated user's profile details
 * 
 * @route GET /api/user
 * @access Private - Protected by middleware
 */
export async function GET(request: AuthenticatedRequest) {
  try {
    // User is already authenticated and attached to request by middleware
    const user = request.user;

    return NextResponse.json({
      user: {
        uid: user.uid,
        email: user.email,
        roles: user.roles,
        displayName: user.displayName,
        approvalStatus: user.approvalStatus,
        phoneNumber: user.phoneNumber,
        jerseyNumber: user.jerseyNumber,
        dateOfBirth: user.dateOfBirth,
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    );
  }
} 