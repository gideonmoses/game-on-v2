import { NextResponse } from 'next/server';
import type { AuthenticatedRequest } from '@/types/auth';

export class APIError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function withErrorHandler(handler: Function) {
  return async (request: AuthenticatedRequest, ...args: any[]) => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      console.error('API Error:', {
        path: request.url,
        error: error instanceof Error ? error.message : error,
        user: request.user?.uid
      });

      if (error instanceof APIError) {
        return NextResponse.json({
          error: error.message,
          code: error.code
        }, { status: error.status });
      }

      // Handle Firebase errors
      if (error?.code?.startsWith('auth/')) {
        return NextResponse.json({
          error: 'Authentication failed',
          code: error.code
        }, { status: 401 });
      }

      return NextResponse.json({
        error: 'Internal server error',
        code: 'internal_error'
      }, { status: 500 });
    }
  };
} 