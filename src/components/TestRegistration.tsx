'use client';

import { useState } from 'react';

interface TestUser {
  email: string;
  password: string;
  phone: string;
  jerseyNumber: number;
  dateOfBirth: string;
}

export default function TestRegistration() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testUsers: TestUser[] = [
    {
      email: 'valid@test.com',
      password: 'Test123!',
      phone: '9876543210',
      jerseyNumber: 7,
      dateOfBirth: '1990-01-01'
    },
    {
      email: 'invalid-phone@test.com',
      password: 'Test123!',
      phone: '123', // Invalid phone
      jerseyNumber: 7,
      dateOfBirth: '1990-01-01'
    },
    {
      email: 'invalid-jersey@test.com',
      password: 'Test123!',
      phone: '9876543210',
      jerseyNumber: 100, // Invalid jersey number
      dateOfBirth: '1990-01-01'
    }
  ];

  const testRegistration = async (user: TestUser) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      const data = await response.json();

      setResult({
        status: response.status,
        data,
        timestamp: new Date().toISOString(),
        testCase: `Register ${user.email}`,
      });

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          Test user registration with various scenarios
        </p>
      </div>

      <div className="space-y-4">
        {testUsers.map((user, index) => (
          <div key={index} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-medium">Test Case {index + 1}</h3>
                <p className="text-sm text-gray-500">Email: {user.email}</p>
              </div>
              <button
                onClick={() => testRegistration(user)}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300"
              >
                {loading ? 'Testing...' : 'Run Test'}
              </button>
            </div>

            <div className="text-sm">
              <p>Phone: {user.phone}</p>
              <p>Jersey: {user.jerseyNumber}</p>
              <p>DOB: {user.dateOfBirth}</p>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {result && (
        <div className="p-4 bg-gray-50 border rounded-lg">
          <h3 className="font-medium mb-2">Last Test Result</h3>
          <pre className="text-sm overflow-auto p-2 bg-white rounded">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 