'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface TestSection {
  id: string;
  title: string;
  component: React.ReactNode;
}

interface TestLayoutProps {
  sections: TestSection[];
}

export default function TestLayout({ sections }: TestLayoutProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Test Dashboard</h1>
          {user && (
            <p className="mt-2 text-sm text-gray-600">
              Logged in as: <span className="font-medium">{user.email}</span>
            </p>
          )}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex">
            {/* Sidebar */}
            <div className="w-64 bg-gray-50 border-r border-gray-200">
              <div className="p-4">
                <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-4">
                  Test Sections
                </h2>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                        activeSection === section.id
                          ? 'bg-blue-50 text-blue-700 font-medium shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <span className="text-sm">{section.title}</span>
                      {activeSection === section.id && (
                        <span className="ml-auto">
                          <svg 
                            className="w-5 h-5" 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path 
                              fillRule="evenodd" 
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                              clipRule="evenodd" 
                            />
                          </svg>
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-h-screen">
              <div className="p-8">
                <div className="max-w-3xl mx-auto">
                  {/* Section Title */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {sections.find((s) => s.id === activeSection)?.title}
                    </h2>
                    <div className="mt-1 h-1 w-20 bg-blue-500 rounded-full"/>
                  </div>

                  {/* Section Content */}
                  <div className="bg-white rounded-lg">
                    {sections.find((s) => s.id === activeSection)?.component}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 