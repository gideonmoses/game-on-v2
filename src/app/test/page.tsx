import TestHealth from '@/components/TestHealth';
import TestAuth from '@/components/TestAuth';
import TestUserDetails from '@/components/TestUserDetails';
import TestRoleAccess from '@/components/TestRoleAccess';
import TestAuthButtons from '@/components/TestAuthButtons';
import TestLayout from '@/components/TestLayout';
import TestRegistration from '@/components/TestRegistration';

export default function TestPage() {
  const sections = [
    {
      id: 'auth',
      title: 'Authentication',
      component: <TestAuth />
    },
    {
      id: 'user',
      title: 'User Details',
      component: <TestUserDetails />
    },
    {
      id: 'roles',
      title: 'Role Management',
      component: (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              Test role-based access control and user permissions management.
            </p>
          </div>
          <TestRoleAccess />
        </div>
      ),
    },
    {
      id: 'health',
      title: 'API Health',
      component: (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              Test API endpoints health and response status.
            </p>
          </div>
          <TestHealth />
        </div>
      ),
    },
    {
      id: 'registration',
      title: 'Registration',
      component: (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              Test user registration functionality and validation.
            </p>
          </div>
          <TestRegistration />
        </div>
      ),
    },
  ];

  return <TestLayout sections={sections} />;
} 