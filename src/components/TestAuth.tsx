'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function TestAuth() {
  const { user } = useAuth();
  const [testResult, setTestResult] = useState<string>('');

  const testAuth = async () => {
    try {
      const response = await fetch('/api/test/health');
      const data = await response.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setTestResult('Error testing auth');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Current User</h3>
        <pre className="bg-gray-100 p-2 rounded">
          {user ? JSON.stringify(user, null, 2) : 'Not logged in'}
        </pre>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Auth Test</h3>
        <button
          onClick={testAuth}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Auth
        </button>
        {testResult && (
          <pre className="mt-2 bg-gray-100 p-2 rounded">{testResult}</pre>
        )}
      </div>
    </div>
  );
} 