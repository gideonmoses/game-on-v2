'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface TestUserData {
  auth: {
    uid: string;
    email: string | null;
    emailVerified: boolean;
    displayName: string | null;
  };
  firestore: {
    role: string;
    createdAt: string;
    lastLogin: string;
  };
  testInfo: {
    endpoint: string;
    timestamp: string;
    environment: string;
  };
}

export default function TestUserDetails() {
  const { user } = useAuth();
  const [testData, setTestData] = useState<TestUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTestUserDetails() {
      try {
        const response = await fetch('/api/test/user-details');
        
        if (!response.ok) {
          throw new Error('Failed to fetch test user details');
        }

        const data = await response.json();
        setTestData(data.testData);
      } catch (err) {
        console.error('Test user details error:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchTestUserDetails();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="p-4 bg-yellow-100 text-yellow-700 rounded">
        Not logged in. Please log in to test user details fetch.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 bg-blue-100 text-blue-700 rounded">
        Testing user details fetch...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        Test User Details Error: {error}
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-100 text-green-700 rounded">
      <h2 className="font-bold mb-4">Test User Details Results:</h2>
      {testData && (
        <div className="space-y-4">
          <div className="bg-white p-3 rounded">
            <h3 className="font-semibold mb-2">Auth Details:</h3>
            <p>UID: {testData.auth.uid}</p>
            <p>Email: {testData.auth.email}</p>
            <p>Verified: {testData.auth.emailVerified ? 'Yes' : 'No'}</p>
            <p>Display Name: {testData.auth.displayName || 'Not set'}</p>
          </div>

          <div className="bg-white p-3 rounded">
            <h3 className="font-semibold mb-2">Firestore Details:</h3>
            <p>Role: {testData.firestore.role}</p>
            <p>Created: {new Date(testData.firestore.createdAt).toLocaleString()}</p>
            <p>Last Login: {new Date(testData.firestore.lastLogin).toLocaleString()}</p>
          </div>

          <div className="bg-white p-3 rounded">
            <h3 className="font-semibold mb-2">Test Information:</h3>
            <p>Endpoint: {testData.testInfo.endpoint}</p>
            <p>Timestamp: {new Date(testData.testInfo.timestamp).toLocaleString()}</p>
            <p>Environment: {testData.testInfo.environment}</p>
          </div>
        </div>
      )}
    </div>
  );
} 