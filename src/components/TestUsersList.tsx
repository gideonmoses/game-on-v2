'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface UserListItem {
  uid: string;
  email: string;
  displayName: string;
  roles: string[];
  subscriptionStatus: string;
  lastLogin: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function TestUsersList() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch(`/api/users?page=${currentPage}&limit=10`);
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch users');
        }

        const data = await response.json();
        setUsers(data.users);
        setPagination(data.pagination);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchUsers();
    }
  }, [user, currentPage]);

  if (!user) {
    return (
      <div className="p-4 bg-yellow-100 text-yellow-700 rounded">
        Please log in to view users
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 bg-blue-100 text-blue-700 rounded">
        Loading users...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Users List</h2>
      
      <div className="grid gap-4">
        {users.map(user => (
          <div key={user.uid} className="p-4 bg-white rounded shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{user.displayName}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              <div className="text-right">
                <div className="text-sm">
                  {user.roles.map(role => (
                    <span 
                      key={role}
                      className="inline-block px-2 py-1 m-1 text-xs rounded bg-blue-100 text-blue-800"
                    >
                      {role}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Last login: {new Date(user.lastLogin).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pagination && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={currentPage === pagination.totalPages}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
} 