import { db } from './firebase-admin';
import {
  User,
  Tournament,
  Match,
  PlayerAvailability,
  TeamSelection,
  Payment,
  PlayerStats,
  UserRole,
  RoleAssignment
} from '@/types/firestore';

// Collection References
const collections = {
  users: db.collection('users'),
  tournaments: db.collection('tournaments'),
  matches: db.collection('matches'),
  playerAvailability: db.collection('playerAvailability'),
  teamSelection: db.collection('teamSelection'),
  payments: db.collection('payments'),
  playerStats: db.collection('playerStats'),
  roleAssignments: db.collection('roleAssignments'),
};

// Example queries and relationships
export const firestoreQueries = {
  // Get all players in a tournament
  getTournamentPlayers: async (tournamentId: string) => {
    const tournament = await collections.tournaments.doc(tournamentId).get();
    const tournamentData = tournament.data() as Tournament;
    return collections.users
      .where('roles', 'array-contains', 'player')
      .where('uid', 'in', tournamentData.teams.flatMap((team: string) => team))
      .get();
  },

  // Get player availability for a match
  getMatchAvailability: async (matchId: string) => {
    return collections.playerAvailability
      .where('matchId', '==', matchId)
      .orderBy('respondedAt', 'desc')
      .get();
  },

  // Get player statistics for a tournament
  getPlayerTournamentStats: async (playerId: string, tournamentId: string) => {
    const matches = await collections.matches
      .where('tournamentId', '==', tournamentId)
      .get();
    
    const matchIds = matches.docs.map(doc => doc.id);
    
    return collections.playerStats
      .where('playerId', '==', playerId)
      .where('matchId', 'in', matchIds)
      .get();
  },

  // Get pending payments for a user
  getUserPendingPayments: async (userId: string) => {
    return collections.payments
      .where('userId', '==', userId)
      .where('status', '==', 'pending')
      .orderBy('dueDate', 'asc')
      .get();
  },

  removeRole: async (userId: string, role: UserRole) => {
    const userDoc = await collections.users.doc(userId).get();
    const userData = userDoc.data() as User;

    await userDoc.ref.update({
      roles: userData.roles.filter((r: UserRole) => r !== role),
      updatedAt: new Date().toISOString(),
    });
  }
};

export const roleQueries = {
  // Check if user has specific role
  hasRole: async (userId: string, role: UserRole): Promise<boolean> => {
    const userDoc = await collections.users.doc(userId).get();
    const userData = userDoc.data() as User;
    return userData.roles.includes(role);
  },

  // Check if user has any of the specified roles
  hasAnyRole: async (userId: string, roles: UserRole[]): Promise<boolean> => {
    const userDoc = await collections.users.doc(userId).get();
    const userData = userDoc.data() as User;
    return userData.roles.some(role => roles.includes(role));
  },

  // Get all users with a specific role
  getUsersByRole: async (role: UserRole) => {
    return collections.users
      .where('roles', 'array-contains', role)
      .get();
  },

  // Get all active role assignments for a user
  getUserRoleAssignments: async (userId: string) => {
    return collections.roleAssignments
      .where('userId', '==', userId)
      .where('validUntil', '==', null)
      .get();
  },

  // Assign a new role to a user
  assignRole: async (
    userId: string, 
    role: UserRole, 
    assignedBy: string,
    scope?: {
      teams?: string[];
      tournaments?: string[];
    }
  ) => {
    const userDoc = await collections.users.doc(userId).get();
    const userData = userDoc.data() as User;
    
    // Add role if not already present
    if (!userData.roles.includes(role)) {
      await userDoc.ref.update({
        roles: [...userData.roles, role],
        updatedAt: new Date().toISOString(),
      });
    }

    // Create role assignment record
    return collections.roleAssignments.add({
      assignmentId: `${userId}_${role}_${Date.now()}`,
      userId,
      role,
      assignedBy,
      validFrom: new Date().toISOString(),
      permissions: getRolePermissions(role), // You'll need to define this function
      scope,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },

  // Remove a role from a user
  removeRole: async (userId: string, role: UserRole, removedBy: string) => {
    const userDoc = await collections.users.doc(userId).get();
    const userData = userDoc.data() as User;

    // Remove role
    await userDoc.ref.update({
      roles: userData.roles.filter(r => r !== role),
      updatedAt: new Date().toISOString(),
    });

    // Update role assignments
    const now = new Date().toISOString();
    const assignments = await collections.roleAssignments
      .where('userId', '==', userId)
      .where('role', '==', role)
      .where('validUntil', '>', now)
      .get();

    // Mark assignments as ended
    const batch = db.batch();
    assignments.docs.forEach(doc => {
      batch.update(doc.ref, { 
        validUntil: now,
        updatedAt: now
      });
    });

    return batch.commit();
  }
};

// Helper function to get role-specific permissions
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

export const userQueries = {
  // Get all pending users
  getPendingUsers: async () => {
    return collections.users
      .where('approvalStatus', '==', 'pending')
      .orderBy('createdAt', 'desc')
      .get();
  },

  // Approve a user
  approveUser: async (userId: string, adminId: string) => {
    const userRef = collections.users.doc(userId);
    const now = new Date().toISOString();

    await userRef.update({
      approvalStatus: 'approved',
      approvedBy: adminId,
      approvedAt: now,
      updatedAt: now,
    });

    // You might want to send a notification to the user here
  },

  // Reject a user
  rejectUser: async (userId: string, adminId: string, reason?: string) => {
    const userRef = collections.users.doc(userId);
    const now = new Date().toISOString();

    await userRef.update({
      approvalStatus: 'rejected',
      approvedBy: adminId,
      approvedAt: now,
      rejectionReason: reason,
      updatedAt: now,
    });

    // You might want to send a notification to the user here
  }
}; 