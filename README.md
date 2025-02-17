# Game-On API

A Next.js API with Firebase authentication and session management for a sports team management system.

## Features

### Authentication
- Firebase Authentication
- Session Management
- Role-based Access Control
- Protected Routes

### User Management
- User Registration with Approval Flow
- Admin User Management
- User Profile Management
- Role Management

## Setup

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Required environment variables:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

3. Configure Firebase:
- Set up Firebase project
- Enable Email/Password authentication
- Set up Firestore with proper rules
- Add service account credentials

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

## API Routes

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/session` - Session management
- `POST /api/auth/verify` - Session verification
- `DELETE /api/auth/session` - Logout

### User Management
- `GET /api/users` - List users (Admin only)
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id/approve` - Approve user (Admin only)
- `PUT /api/users/:id/roles` - Update user roles (Admin only)
- `PUT /api/users/:id` - Update user profile

## Testing

The project includes Postman collections for API testing:

1. Auth Flow Collection
   - Registration
   - Login
   - Session Management
   - Logout

2. User Management Collection
   - User Listing
   - User Approval
   - Role Management

Import collections from the `postman` directory and set up environment variables.

## Documentation

- API documentation in `postman` directory
- Route configuration in `src/config/routes.ts`
- Middleware configuration in `src/middleware.ts`

## Development

### Protected Routes
Routes are protected using the middleware system. Configure route protection in `src/config/routes.ts`:

```typescript
export const routes = {
  auth: {
    // Authentication routes
  },
  admin: {
    // Admin-only routes
  },
  user: {
    // User routes with role-based access
  }
};
```

### Role-Based Access
The system supports role-based access control:
- `admin` - Full system access
- `manager` - Team management access
- `player` - Basic user access
