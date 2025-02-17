export type UserRole = 'admin' | 'player' | 'manager';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber: string;
  jerseyNumber: number;
  dateOfBirth: string;
  roles: UserRole[];
  approvalStatus: 'pending' | 'approved' | 'rejected';
  emailVerified: boolean;
  subscriptionStatus: 'active' | 'inactive';
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  playerDetails?: {
    isActive: boolean;
    // Add other player-specific fields
  };
}

export interface UserListResponse {
  users: UserProfile[];
  pagination?: {
    nextPageToken?: string;
    total: number;
  };
}

export interface UserUpdateRequest {
  displayName?: string;
  phoneNumber?: string;
  jerseyNumber?: number;
  roles?: UserRole[];
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  playerDetails?: {
    isActive?: boolean;
  };
} 