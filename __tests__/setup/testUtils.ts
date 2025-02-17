import type { UserProfile } from '@/types/user';
import { auth, db } from '@/lib/firebase/firebase-admin';

export class TestUtils {
  static async createTestUser(data: Partial<UserProfile> = {}): Promise<UserProfile> {
    const userRecord = await auth.createUser({
      email: `test-${Date.now()}@example.com`,
      password: 'Test123!',
      emailVerified: false
    });

    const userData: UserProfile = {
      uid: userRecord.uid,
      email: userRecord.email!,
      displayName: data.displayName || 'Test User',
      phoneNumber: data.phoneNumber || '9876543210',
      jerseyNumber: data.jerseyNumber || Math.floor(Math.random() * 98) + 1,
      dateOfBirth: data.dateOfBirth || '1990-01-01',
      roles: data.roles || ['player'],
      approvalStatus: data.approvalStatus || 'pending',
      emailVerified: false,
      subscriptionStatus: 'active',
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      playerDetails: data.playerDetails || { isActive: true }
    };

    await db.collection('users').doc(userRecord.uid).set(userData);
    return userData;
  }

  static async cleanupTestUser(uid: string): Promise<void> {
    await Promise.all([
      auth.deleteUser(uid),
      db.collection('users').doc(uid).delete()
    ]);
  }

  static async createAuthenticatedRequest(user?: Partial<UserProfile>) {
    const testUser = await this.createTestUser(user);
    const sessionCookie = 'test-session-cookie';

    return {
      user: testUser,
      sessionCookie,
      cleanup: () => this.cleanupTestUser(testUser.uid)
    };
  }
} 