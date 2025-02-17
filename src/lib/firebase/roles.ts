import { db } from './firebase-admin';
import type { UserRole } from '@/types/firestore';

export interface RoleAssignmentRequest {
  userId: string;
  roles: UserRole[];
  assignedBy: string;
  scope?: {
    teams?: string[];
    tournaments?: string[];
  };
}

export class RoleService {
  private static validateRoles(roles: UserRole[]) {
    const validRoles: UserRole[] = ['admin', 'player', 'selector', 'manager'];
    const invalidRoles = roles.filter(role => !validRoles.includes(role));
    
    if (invalidRoles.length > 0) {
      throw new Error(`Invalid roles: ${invalidRoles.join(', ')}`);
    }
  }

  static async assignRoles(request: RoleAssignmentRequest) {
    const { userId, roles, assignedBy, scope } = request;
    
    try {
      // Validate roles
      this.validateRoles(roles);

      // Start a batch write
      const batch = db.batch();

      // Update user document
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      // Update user's roles
      batch.update(userRef, {
        roles: roles,
        updatedAt: new Date().toISOString(),
      });

      // Create role assignment records
      const assignmentRef = db.collection('roleAssignments');
      const timestamp = new Date().toISOString();

      roles.forEach(role => {
        const newAssignmentRef = assignmentRef.doc();
        batch.set(newAssignmentRef, {
          assignmentId: newAssignmentRef.id,
          userId,
          role,
          assignedBy,
          validFrom: timestamp,
          scope: scope || null,
          permissions: getRolePermissions(role),
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      });

      // Commit the batch
      await batch.commit();

      return {
        success: true,
        userId,
        assignedRoles: roles,
        timestamp,
      };
    } catch (error) {
      console.error('Role assignment error:', error);
      throw error;
    }
  }
}

function getRolePermissions(role: UserRole): string[] {
  const permissions = {
    admin: [
      'manage_users',
      'manage_roles',
      'manage_tournaments',
      'manage_teams',
      'manage_payments',
      'view_all'
    ],
    selector: [
      'view_players',
      'manage_team_selection',
      'view_player_stats',
      'manage_availability'
    ],
    manager: [
      'manage_team',
      'view_team_stats',
      'manage_team_schedule',
      'manage_team_payments'
    ],
    player: [
      'view_own_stats',
      'manage_own_availability',
      'view_team_schedule',
      'view_team_selection'
    ]
  };

  return permissions[role] || [];
} 