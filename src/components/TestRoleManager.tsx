'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const AVAILABLE_ROLES = ['admin', 'player', 'selector', 'manager'] as const;

interface RoleAssignmentForm {
  userId: string;
  roles: typeof AVAILABLE_ROLES[number][];
  scope?: {
    teams?: string[];
    tournaments?: string[];
  };
}

export default function TestRoleManager() {
  const { user } = useAuth();
  const [form, setForm] = useState<RoleAssignmentForm>({
    userId: '',
    roles: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRoleToggle = (role: typeof AVAILABLE_ROLES[number]) => {
    setForm(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/users/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign roles');
      }

      setSuccess(`Successfully assigned roles to user ${form.userId}`);
      setForm({ userId: '', roles: [] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4 bg-yellow-100 text-yellow-700 rounded">
        Please log in to manage roles
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Test Role Manager</h2>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            User ID
          </label>
          <input
            type="text"
            value={form.userId}
            onChange={e => setForm(prev => ({ ...prev, userId: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Roles
          </label>
          <div className="space-y-2">
            {AVAILABLE_ROLES.map(role => (
              <label key={role} className="flex items-center">
                <input
                  type="checkbox"
                  checked={form.roles.includes(role)}
                  onChange={() => handleRoleToggle(role)}
                  className="rounded border-gray-300 text-blue-600"
                />
                <span className="ml-2 text-gray-700">{role}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || form.roles.length === 0}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
        >
          {loading ? 'Assigning...' : 'Assign Roles'}
        </button>
      </form>
    </div>
  );
} 