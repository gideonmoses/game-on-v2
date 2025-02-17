// Type definitions for Firestore collections
export interface FirestoreTimestamps {
  createdAt: string;
  updatedAt: string;
}

// Roles type
export type UserRole = 'admin' | 'player' | 'selector' | 'manager';

// Users Collection
export interface User extends FirestoreTimestamps {
  uid: string;
  email: string;
  displayName: string;
  roles: UserRole[];
  approvalStatus: 'pending' | 'approved' | 'rejected';
  phoneNumber: string;
  jerseyNumber: number;
  dateOfBirth: string;
  profileImage?: string;
  emailVerified: boolean;
  playerDetails?: {
    battingStyle?: 'right' | 'left';
    bowlingStyle?: string;
    position?: string[];
    isActive: boolean;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  subscriptionStatus: 'active' | 'inactive';
  lastLogin: string;
  rejectionReason?: string;
}

// Role Assignments Collection
export interface RoleAssignment extends FirestoreTimestamps {
  assignmentId: string;
  userId: string;
  role: UserRole;
  assignedBy: string; // UID of admin who assigned the role
  validFrom: string;
  validUntil?: string;
  permissions: string[]; // Array of specific permissions
  scope?: {
    teams?: string[];      // Specific teams this role applies to
    tournaments?: string[]; // Specific tournaments this role applies to
  };
}

// Tournaments Collection
export interface Tournament extends FirestoreTimestamps {
  tournamentId: string;
  name: string;
  startDate: string;
  endDate: string;
  venue: string;
  format: 'T20' | 'ODI' | 'Test';
  status: 'upcoming' | 'ongoing' | 'completed';
  organizer: string;
  description: string;
  teams: string[]; // Array of team IDs
  matches: string[]; // Array of match IDs
  rules: string[];
  prizeMoney: number;
}

// Matches Collection
export interface Match extends FirestoreTimestamps {
  matchId: string;
  tournamentId: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  venue: string;
  format: 'T20' | 'ODI' | 'Test';
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  result?: {
    winner: string;
    manOfTheMatch: string;
    homeTeamScore: {
      runs: number;
      wickets: number;
      overs: number;
    };
    awayTeamScore: {
      runs: number;
      wickets: number;
      overs: number;
    };
  };
  selectedPlayers: {
    homeTeam: string[]; // Array of player UIDs
    awayTeam: string[]; // Array of player UIDs
  };
  umpires: string[];
  matchReport?: string;
}

// Player Availability Collection
export interface PlayerAvailability extends FirestoreTimestamps {
  availabilityId: string;
  playerId: string;
  matchId: string;
  status: 'available' | 'unavailable' | 'maybe';
  reason?: string;
  respondedAt: string;
  notes?: string;
}

// Team Selection Collection
export interface TeamSelection extends FirestoreTimestamps {
  selectionId: string;
  matchId: string;
  selectedPlayers: string[]; // Array of player UIDs
  reserves: string[]; // Array of reserve player UIDs
  captain: string; // player UID
  viceCaptain: string; // player UID
  selectionNotes?: string;
  selectionStatus: 'draft' | 'final';
  selector: string; // UID of selector/coach
}

// Payments Collection
export interface Payment extends FirestoreTimestamps {
  paymentId: string;
  userId: string;
  amount: number;
  type: 'subscription' | 'tournament' | 'equipment' | 'other';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  dueDate: string;
  paidDate?: string;
  description: string;
  paymentMethod?: string;
  transactionId?: string;
  receiptUrl?: string;
}

// Player Statistics Collection
export interface PlayerStats extends FirestoreTimestamps {
  playerId: string;
  matchId: string;
  batting: {
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    notOut: boolean;
  };
  bowling: {
    overs: number;
    maidens: number;
    runs: number;
    wickets: number;
    economy: number;
  };
  fielding: {
    catches: number;
    runOuts: number;
    stumpings: number;
  };
} 