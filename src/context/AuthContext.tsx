"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (data: SignupData) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

interface SignupData {
  email: string;
  password: string;
  phone: string;
  jerseyNumber: number;
  dateOfBirth: string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signup: async () => {},
  login: async () => {},
  signOut: async () => {},
  error: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get the ID token
          const token = await firebaseUser.getIdToken();
          
          // Create session
          await fetch('/api/auth/session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          });

          // Verify session and get user data
          const verifyResponse = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              sessionCookie: document.cookie.match(/session=([^;]+)/)?.[1] 
            }),
          });

          const { valid, user: userData } = await verifyResponse.json();
          
          if (valid) {
            setUser(userData);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Auth state error:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (data: SignupData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      // Login after successful registration
      await login(data.email, data.password);
    } catch (error) {
      console.error('Signup error:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign up');
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      // First authenticate with Firebase
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Check user's approval status in Firestore
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      const userData = userDoc.data();
      
      if (!userData || userData.approvalStatus !== 'approved') {
        // If not approved, sign out and throw error
        await firebaseSignOut(auth);
        throw new Error(
          userData?.approvalStatus === 'pending' 
            ? 'Your account is pending approval. Please wait for admin approval.'
            : userData?.approvalStatus === 'rejected'
            ? 'Your account has been rejected. Please contact administrator.'
            : 'Account not approved'
        );
      }

      // If approved, proceed with session creation
      const token = await result.user.getIdToken();
      
      // Set session cookie
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Failed to login');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // Clear session cookie
      await fetch('/api/auth/session', {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, signOut, error }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 