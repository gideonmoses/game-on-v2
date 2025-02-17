'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface UserData {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName: string | null;
  photoURL: string | null;
  role: string;
  createdAt: string;
}

export default function UserProfile() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch('/api/user');
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUserData(data.user);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return <div>Please log in to view your profile</div>;
  }

  if (loading) {
    return <div>Loading user data...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>
      {userData && (
        <div className="space-y-3">
          <p><span className="font-semibold">Email:</span> {userData.email}</p>
          <p><span className="font-semibold">Display Name:</span> {userData.displayName || 'Not set'}</p>
          <p><span className="font-semibold">Role:</span> {userData.role}</p>
          <p><span className="font-semibold">Email Verified:</span> {userData.emailVerified ? 'Yes' : 'No'}</p>
          <p><span className="font-semibold">Member Since:</span> {new Date(userData.createdAt).toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
} 