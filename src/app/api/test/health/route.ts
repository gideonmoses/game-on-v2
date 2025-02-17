import { NextResponse } from 'next/server';

/**
 * Health Check API
 * Public endpoint to verify API status
 */
export async function GET() {
  try {
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: 'Service unavailable'
      },
      { status: 500 }
    );
  }
} 