import { NextResponse } from 'next/server';
import type { AuthenticatedRequest } from '@/types/auth';
import { z } from 'zod';

export function withValidation<T>(schema: z.Schema<T>, handler: (request: AuthenticatedRequest, data: T) => Promise<NextResponse>) {
  return async (request: AuthenticatedRequest) => {
    try {
      const body = await request.json();
      const validatedData = schema.parse(body);
      return handler(request, validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({
          error: 'Validation failed',
          details: error.errors
        }, { status: 400 });
      }
      throw error;
    }
  };
}

// User validation schemas
export const userUpdateSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  phoneNumber: z.string().regex(/^\d{10}$/).optional(),
  jerseyNumber: z.number().min(1).max(99).optional(),
  roles: z.array(z.enum(['admin', 'player', 'manager'])).optional(),
  approvalStatus: z.enum(['pending', 'approved', 'rejected']).optional(),
  playerDetails: z.object({
    isActive: z.boolean()
  }).optional()
}); 