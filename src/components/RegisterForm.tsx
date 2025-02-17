'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface RegisterFormData {
  email: string;
  password: string;
  phone: string;
  jerseyNumber: number;
  dateOfBirth: string;
}

export default function RegisterForm() {
  const { signup, error } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    phone: '',
    jerseyNumber: 0,
    dateOfBirth: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signup(formData);
    } catch (error) {
      // Error is handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Register</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 required">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 required">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 required">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            required
            pattern="[0-9]{10}"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">10-digit mobile number</p>
        </div>

        <div>
          <label htmlFor="jerseyNumber" className="block text-sm font-medium text-gray-700 required">
            Jersey Number
          </label>
          <input
            id="jerseyNumber"
            type="number"
            required
            min={1}
            max={99}
            value={formData.jerseyNumber || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, jerseyNumber: parseInt(e.target.value) }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 required">
            Date of Birth
          </label>
          <input
            id="dateOfBirth"
            type="date"
            required
            value={formData.dateOfBirth}
            onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
} 