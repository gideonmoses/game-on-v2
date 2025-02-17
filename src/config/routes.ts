type RouteProtection = {
  path: string;
  roles?: string[];
  requireAuth?: boolean;
  description?: string;
};

type RouteConfig = {
  public: string[];
  protected: RouteProtection[];
  admin: RouteProtection[];
};

export const routes: RouteConfig = {
  // Routes that don't require authentication
  public: [
    '/api/auth/register',
    '/api/auth/session',
    '/api/auth/verify',
    '/api/health',
    '/api/auth/login',
    '/api/auth/logout',
    '/api/test/health',
    '/_next',
    'favicon.ico',
  ],

  // Routes that require authentication
  protected: [
    {
      path: '/api/user',
      requireAuth: true,
      description: 'User profile management',
    },
    {
      path: '/api/profile',
      requireAuth: true,
      description: 'User profile operations',
    },
    {
      path: '/test',
      requireAuth: true,
      description: 'Test dashboard access',
    },
    {
      path: '/api/test',
      requireAuth: true,
      description: 'Test API endpoints',
    },
    {
      path: '/api/users',
      requireAuth: true,
      description: 'User management operations',
    },
  ],

  // Routes that require admin role
  admin: [
    {
      path: '/api/admin',
      roles: ['admin'],
      description: 'Admin dashboard APIs',
    },
    {
      path: '/api/admin/migrate-roles',
      roles: ['admin'],
      description: 'Role migration utility',
    },
    {
      path: '/api/users/roles',
      roles: ['admin'],
      description: 'Role management operations',
    },
    {
      path: '/api/settings',
      roles: ['admin'],
      description: 'System settings management',
    },
    {
      path: '/admin',
      roles: ['admin'],
      description: 'Admin dashboard UI',
    },
    {
      path: '/api/admin/users',
      roles: ['admin'],
      description: 'User administration',
    },
    {
      path: '/api/admin/approvals',
      roles: ['admin'],
      description: 'User approval management',
    },
    {
      path: '/api/admin/settings',
      roles: ['admin'],
      description: 'System configuration',
    },
  ],
};

// Helper functions
export function isPublicRoute(pathname: string): boolean {
  return routes.public.some(route => pathname.startsWith(route));
}

export function getRouteProtection(pathname: string): RouteProtection | undefined {
  return [
    ...routes.protected,
    ...routes.admin,
  ].find(route => pathname.startsWith(route.path));
}

export function requiresAdminRole(pathname: string): boolean {
  return routes.admin.some(route => pathname.startsWith(route.path));
}

// Additional helper for getting route description
export function getRouteDescription(pathname: string): string | undefined {
  const route = getRouteProtection(pathname);
  return route?.description;
} 