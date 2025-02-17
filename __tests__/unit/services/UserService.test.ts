import { describe, expect, it, jest } from '@jest/globals';
import { UserService } from '@/lib/services/UserService';
import { db } from '@/lib/firebase/firebase-admin';

jest.mock('@/lib/firebase/firebase-admin');

describe('UserService', () => {
  describe('canAccessUser', () => {
    it('should allow admin access to any user', async () => {
      const adminUser = { uid: 'admin1', roles: ['admin'] };
      const result = await UserService.canAccessUser(adminUser, 'user1');
      expect(result).toBe(true);
    });

    // More test cases...
  });

  // More service tests...
}); 