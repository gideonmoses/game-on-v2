import { NextResponse } from 'next/server';
import type { AuthenticatedRequest } from '@/types/auth';
import { UserService } from '@/lib/services/UserService';
import { playerOrAdmin } from '@/lib/middleware/auth/roleAccess';
import { withValidation } from '@/lib/middleware/validation/schemas';
import { z } from 'zod';

// Query parameters validation schema
const listQuerySchema = z.object({
  pageSize: z.string().regex(/^\d+$/).transform(Number).default('10'),
  pageToken: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  role: z.enum(['admin', 'player', 'manager']).optional()
});

type ListQueryParams = z.infer<typeof listQuerySchema>;

async function listHandler(
  request: AuthenticatedRequest,
  query: ListQueryParams
) {
  try {
    const { user } = request;
    const { searchParams } = new URL(request.url);
    
    // Build query parameters
    const queryParams = {
      pageSize: parseInt(searchParams.get('pageSize') || '10'),
      pageToken: searchParams.get('pageToken') || undefined,
      status: searchParams.get('status') as ListQueryParams['status'],
      role: searchParams.get('role') as ListQueryParams['role']
    };

    // Validate query parameters
    const validatedQuery = listQuerySchema.parse(queryParams);

    // Build base query
    let query = {
      pageSize: validatedQuery.pageSize,
      filters: {} as Record<string, unknown>
    };

    // If not admin, only show approved users
    if (!user.roles.includes('admin')) {
      query.filters.approvalStatus = 'approved';
    } else if (validatedQuery.status) {
      query.filters.approvalStatus = validatedQuery.status;
    }

    // Add role filter if specified
    if (validatedQuery.role) {
      query.filters.roles = validatedQuery.role;
    }

    // Get users with pagination
    const { users, pagination } = await UserService.listUsers(
      query.pageSize,
      query.filters,
      validatedQuery.pageToken
    );

    // Sanitize user data based on requester's role
    const sanitizedUsers = users.map(userData => 
      UserService.sanitizeUserData(userData, user)
    );

    return NextResponse.json({
      users: sanitizedUsers,
      pagination: user.roles.includes('admin') ? pagination : undefined
    });

  } catch (error) {
    console.error('User listing error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid query parameters',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export const GET = playerOrAdmin(listHandler); 