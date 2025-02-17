import { db } from '@/lib/firebase/firebase-admin';
import type { UserProfile, UserUpdateRequest } from '@/types/user';

interface ListUsersQuery {
  pageSize: number;
  filters: Record<string, unknown>;
  pageToken?: string;
}

interface ListUsersResponse {
  users: UserProfile[];
  pagination?: {
    nextPageToken?: string;
    total: number;
  };
}

export class UserService {
  static async canAccessUser(requestingUser: { uid: string; roles: string[] }, targetUserId: string): Promise<boolean> {
    if (requestingUser.roles.includes('admin')) return true;
    if (requestingUser.uid === targetUserId) return true;

    const targetUser = await db.collection('users').doc(targetUserId).get();
    return targetUser.exists && 
           (targetUser.data() as UserProfile).approvalStatus === 'approved';
  }

  static sanitizeUserData(userData: UserProfile, requestingUser: { uid: string; roles: string[] }): Partial<UserProfile> {
    if (requestingUser.roles.includes('admin')) return userData;
    
    if (requestingUser.uid === userData.uid) {
      const { roles, emailVerified, ...safeData } = userData;
      return safeData;
    }

    return {
      uid: userData.uid,
      displayName: userData.displayName,
      jerseyNumber: userData.jerseyNumber,
      approvalStatus: userData.approvalStatus,
      playerDetails: userData.playerDetails,
    };
  }

  static async getUser(uid: string): Promise<UserProfile | null> {
    const userDoc = await db.collection('users').doc(uid).get();
    return userDoc.exists ? (userDoc.data() as UserProfile) : null;
  }

  static async updateUser(uid: string, updates: UserUpdateRequest): Promise<UserProfile> {
    const userRef = db.collection('users').doc(uid);
    await userRef.update({
      ...updates,
      updatedAt: new Date().toISOString()
    });

    const updated = await userRef.get();
    return updated.data() as UserProfile;
  }

  static async validateUserUpdate(
    requestingUser: { uid: string; roles: string[] },
    targetUserId: string,
    updates: UserUpdateRequest
  ): Promise<{ valid: boolean; error?: string }> {
    // Verify user exists
    const userDoc = await db.collection('users').doc(targetUserId).get();
    if (!userDoc.exists) {
      return { valid: false, error: 'User not found' };
    }

    const currentData = userDoc.data() as UserProfile;

    // Only admins can update certain fields
    if (!requestingUser.roles.includes('admin')) {
      // Check for unauthorized field updates
      const sensitiveFields = ['roles', 'approvalStatus', 'emailVerified', 'uid'];
      const hasUnauthorizedUpdates = Object.keys(updates).some(key => 
        sensitiveFields.includes(key) || 
        (currentData[key] && typeof currentData[key] !== typeof updates[key])
      );

      if (hasUnauthorizedUpdates) {
        return { valid: false, error: 'Unauthorized field updates' };
      }

      // Non-admins can only update their own profile
      if (requestingUser.uid !== targetUserId) {
        return { valid: false, error: 'Cannot update other users' };
      }
    }

    return { valid: true };
  }

  static async listUsers(
    pageSize: number,
    filters: Record<string, unknown> = {},
    pageToken?: string
  ): Promise<ListUsersResponse> {
    // Build query
    let query = db.collection('users');

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'roles') {
        query = query.where(key, 'array-contains', value);
      } else {
        query = query.where(key, '==', value);
      }
    });

    // Add pagination
    if (pageToken) {
      const lastDoc = await db.collection('users').doc(pageToken).get();
      query = query.startAfter(lastDoc);
    }
    query = query.limit(pageSize);

    // Execute query
    const snapshot = await query.get();
    
    // Get total count
    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;

    // Format response
    const users = snapshot.docs.map(doc => ({
      ...doc.data(),
      uid: doc.id
    })) as UserProfile[];

    return {
      users,
      pagination: {
        nextPageToken: snapshot.docs[snapshot.docs.length - 1]?.id,
        total
      }
    };
  }
} 