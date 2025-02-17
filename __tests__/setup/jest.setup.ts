import '@testing-library/jest-dom';
import { loadEnvConfig } from '@next/env';

// Load environment variables
loadEnvConfig(process.cwd());

// Mock Firebase Admin
jest.mock('@/lib/firebase/firebase-admin', () => ({
  auth: {
    verifyIdToken: jest.fn(),
    createSessionCookie: jest.fn(),
    verifySessionCookie: jest.fn(),
  },
  db: {
    collection: jest.fn(),
  }
}));

// Global test setup
beforeAll(() => {
  // Setup test database or mocks
});

afterAll(() => {
  // Cleanup
}); 