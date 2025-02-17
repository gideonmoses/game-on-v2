'use client';

import { useState, useEffect } from 'react';

interface HealthStatus {
  status: string;
  message: string;
  timestamp: string;
}

export default function TestHealth() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkHealth() {
      try {
        const response = await fetch('/api/test/health');
        
        if (!response.ok) {
          throw new Error('Health check failed');
        }

        const data = await response.json();
        setHealth(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    }

    checkHealth();
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-blue-100 text-blue-700 rounded">
        Checking API health...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        Health Check Error: {error}
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-100 text-green-700 rounded">
      <h2 className="font-bold mb-2">API Health Check Results:</h2>
      {health && (
        <div className="space-y-2">
          <p>✓ Status: {health.status}</p>
          <p>✓ Message: {health.message}</p>
          <p>✓ Last Checked: {new Date(health.timestamp).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
} 