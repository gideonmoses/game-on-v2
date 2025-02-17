'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface RoleTestResult {
  user: {
    uid: string;
    email: string;
    roles: {
      isAdmin: boolean;
      isPlayer: boolean;
      isSelector: boolean;
      isManager: boolean;
    };
  };
  roleAssignments: Array<{
    role: string;
    validFrom: string;
    validUntil?: string;
    scope?: {
      teams?: string[];
      tournaments?: string[];
    };
  }>;
  accessTests: Array<{
    endpoint: string;
    requiredRole: string;
    hasAccess: boolean;
    result: string;
  }>;
}

export default function TestRoleAccess() {
  const { user } = useAuth();
  const [testResult, setTestResult] = useState<RoleTestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testRoleAccess() {
      try {
        const response = await fetch('/api/test/roles');
        
        if (!response.ok) {
          throw new Error('Role test failed');
        }

        const data = await response.json();
        setTestResult(data);
      } catch (err) {
        console.error('Role test error:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      testRoleAccess();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="p-4 bg-yellow-100 text-yellow-700 rounded">
        Please log in to test role access
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 bg-blue-100 text-blue-700 rounded">
        Testing role access...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        Role Test Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Role Access Test Results</h2>
        
        {testResult && (
          <>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded">
                <h3 className="font-semibold mb-2">User Roles</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(testResult.user.roles).map(([role, hasRole]) => (
                    <div key={role} className={`p-2 rounded ${hasRole ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {role.replace('is', '')}: {hasRole ? '✓' : '✗'}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded">
                <h3 className="font-semibold mb-2">Access Tests</h3>
                <div className="space-y-2">
                  {testResult.accessTests.map((test, index) => (
                    <div key={index} className={`p-3 rounded ${
                      test.hasAccess ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <p className="font-medium">{test.endpoint}</p>
                      <p className="text-sm">Required Role: {test.requiredRole}</p>
                      <p className="text-sm">Result: {test.result}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 