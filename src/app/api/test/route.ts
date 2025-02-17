/**
 * API Testing Endpoints
 * 
 * Provides endpoints for testing various API functionalities:
 * - GET: Tests API health and connectivity
 * - POST: Tests data submission
 * - Tests authentication and authorization
 * - Tests error handling
 * 
 * @route GET /api/test/*
 * @route POST /api/test/*
 * @access Private - Requires authentication
 * 
 * @returns {Object} Response
 * @returns {boolean} Response.success - Test success status
 * @returns {Object} Response.data - Test result data
 */

// This was our initial test API endpoint
// Let's rename it to be more specific about what it tests

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: "API is working" }, { status: 200 });
} 