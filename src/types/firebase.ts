export interface FirebaseError extends Error {
  code: string;
  message: string;
  errorInfo?: Record<string, unknown>;
  codePrefix?: string;
}

export interface FirebaseAuthError extends FirebaseError {
  code: 
    | 'auth/user-not-found'
    | 'auth/email-already-exists'
    | 'auth/invalid-email'
    | 'auth/weak-password'
    | 'auth/id-token-expired'
    | 'auth/session-cookie-expired'
    | 'auth/invalid-session-cookie'
    | 'auth/argument-error';
} 