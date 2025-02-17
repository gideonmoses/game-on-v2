import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/firebase-admin';
import { adminAuthMiddleware } from '@/lib/middleware/adminAuth';

export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    const authResponse = await adminAuthMiddleware();
    if (authResponse) return authResponse;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const sortBy = searchParams.get('sortBy') || 'displayName';
    const order = searchParams.get('order') || 'asc';

    // Build query
    let query = db.collection('users');

    // Apply role filter if specified
    if (role) {
      query = query.where('roles', 'array-contains', role);
    }

    // Apply sorting
    query = query.orderBy(sortBy, order as 'asc' | 'desc');

    // Apply pagination
    const startAt = (page - 1) * limit;
    query = query.limit(limit).offset(startAt);

    // Execute query
    const snapshot = await query.get();
    
    // Transform data
    const users = snapshot.docs.map(doc => {
      const userData = doc.data();
      return {
        uid: doc.id,
        email: userData.email,
        displayName: userData.displayName,
        roles: userData.roles,
        phoneNumber: userData.phoneNumber,
        subscriptionStatus: userData.subscriptionStatus,
        lastLogin: userData.lastLogin,
        // Exclude sensitive information
        // Add any other fields you want to expose
      };
    });

    // Get total count for pagination
    const totalSnapshot = await db.collection('users').count().get();
    const total = totalSnapshot.data().count;

    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        role,
        sortBy,
        order,
      }
    });
  } catch (error) {
    console.error('Users API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 