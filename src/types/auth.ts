import type { NextRequest } from 'next/server';
import type { User } from './firestore';

export interface AuthenticatedRequest extends NextRequest {
  user: User;
} 