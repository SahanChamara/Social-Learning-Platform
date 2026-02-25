# Authentication Context

Complete authentication system using React Context API, Apollo Client, and JWT tokens.

## Overview

The AuthContext provides a centralized authentication state management system for the Social Learning Platform. It handles user login, registration, logout, token management, and automatic authentication refresh.

## Features

- ✅ **User Authentication** - Login and register functionality
- ✅ **JWT Token Management** - Automatic token storage in localStorage
- ✅ **Refresh Token Support** - Auto-refresh expired tokens
- ✅ **Apollo Client Integration** - GraphQL mutations for auth operations
- ✅ **Persistent Sessions** - Maintains auth state across page refreshes
- ✅ **Auto Logout** - Clears state on token expiration
- ✅ **TypeScript Support** - Full type safety with TypeScript

## Architecture

### Files Structure

```
src/
├── contexts/
│   ├── AuthContext.tsx       # Main auth context and provider
│   └── index.ts              # Barrel exports
├── graphql/
│   ├── auth.ts               # GraphQL mutations and queries
│   └── index.ts
├── types/
│   ├── auth.ts               # TypeScript type definitions
│   └── index.ts
└── lib/
    └── apollo.ts             # Apollo client with auth middleware
```

### Token Storage

Tokens are stored in localStorage:
- `authToken` - JWT access token (24 hours expiration)
- `refreshToken` - Refresh token (7 days expiration)

### GraphQL Operations

**Mutations:**
- `LOGIN_MUTATION` - Authenticate user with email/username and password
- `REGISTER_MUTATION` - Create new user account
- `REFRESH_TOKEN_MUTATION` - Refresh access token using refresh token

**Queries:**
- `ME_QUERY` - Get current authenticated user
- `USER_QUERY` - Get user by ID

## Usage

### Basic Usage

```tsx
import { useAuth } from '@/contexts';

function MyComponent() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.fullName}!</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Login Example

```tsx
import { useAuth } from '@/contexts';
import { useState } from 'react';

function LoginForm() {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({
    emailOrUsername: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(credentials);
      // Login successful - user state updated automatically
      console.log('Logged in!');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Email or Username"
        value={credentials.emailOrUsername}
        onChange={(e) => setCredentials({ ...credentials, emailOrUsername: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        value={credentials.password}
        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

### Register Example

```tsx
import { useAuth } from '@/contexts';
import { useState } from 'react';

function RegisterForm() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await register(formData);
      // Registration successful - user logged in automatically
      console.log('Account created!');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Username"
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <input
        type="text"
        placeholder="Full Name"
        value={formData.fullName}
        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      <button type="submit">Register</button>
    </form>
  );
}
```

### Protected Routes

```tsx
import { useAuth } from '@/contexts';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
}

// Usage in router:
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

### Conditional Rendering Based on Role

```tsx
import { useAuth } from '@/contexts';
import { UserRole } from '@/types';

function AdminPanel() {
  const { user } = useAuth();

  if (user?.role !== UserRole.ADMIN) {
    return <div>Access denied</div>;
  }

  return <div>Admin controls...</div>;
}
```

## API Reference

### `useAuth()` Hook

Returns an object with the following properties and methods:

#### Properties

- **`user: User | null`**
  - Currently authenticated user object
  - `null` if not authenticated

- **`isAuthenticated: boolean`**
  - `true` if user is logged in
  - `false` otherwise

- **`isLoading: boolean`**
  - `true` during initial auth check
  - `false` once auth state is determined

#### Methods

- **`login(input: LoginInput): Promise<void>`**
  - Authenticates user with credentials
  - **Parameters:**
    - `input.emailOrUsername: string` - Email or username
    - `input.password: string` - User password
  - **Throws:** Error if authentication fails
  - **Side Effects:** Updates user state, stores tokens

- **`register(input: RegisterInput): Promise<void>`**
  - Creates new user account and logs in
  - **Parameters:**
    - `input.username: string` - Unique username (3-50 chars)
    - `input.email: string` - Valid email address
    - `input.password: string` - Password (min 8 chars)
    - `input.fullName: string` - User's full name
  - **Throws:** Error if registration fails
  - **Side Effects:** Updates user state, stores tokens

- **`logout(): void`**
  - Logs out current user
  - **Side Effects:** Clears user state, removes tokens, clears Apollo cache

- **`refreshAuth(): Promise<void>`**
  - Refreshes authentication state
  - Attempts to get current user from token
  - Falls back to refresh token if needed
  - **Side Effects:** Updates user state or logs out if refresh fails

## Types

### User

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  expertise?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}
```

### UserRole

```typescript
enum UserRole {
  LEARNER = 'LEARNER',
  CREATOR = 'CREATOR',
  ADMIN = 'ADMIN',
}
```

### LoginInput

```typescript
interface LoginInput {
  emailOrUsername: string;
  password: string;
}
```

### RegisterInput

```typescript
interface RegisterInput {
  username: string;
  email: string;
  password: string;
  fullName: string;
}
```

## Authentication Flow

### Initial Load
1. AuthProvider mounts
2. Checks localStorage for `authToken`
3. If token exists, queries backend with `ME_QUERY`
4. If valid, sets user state
5. If invalid, attempts refresh with `refreshToken`
6. If refresh fails, clears tokens and logs out

### Login Flow
1. User submits credentials
2. `LOGIN_MUTATION` sent to backend
3. Backend validates credentials
4. Returns JWT tokens and user data
5. Tokens stored in localStorage
6. User state updated
7. Apollo cache updated with user data

### Logout Flow
1. User clicks logout
2. Tokens removed from localStorage
3. User state cleared
4. Apollo cache cleared
5. User redirected (if needed)

## Error Handling

The AuthContext handles various error scenarios:

- **Invalid Credentials** - Login/register mutations throw errors with messages
- **Token Expiration** - Automatically refreshes tokens
- **Network Errors** - Propagated to calling components
- **401 Unauthorized** - Apollo error link clears auth and redirects to login

### Example Error Handling

```tsx
const { login } = useAuth();

try {
  await login(credentials);
} catch (error) {
  if (error.message.includes('Invalid credentials')) {
    setError('Email or password is incorrect');
  } else if (error.message.includes('Account is deactivated')) {
    setError('Your account has been deactivated');
  } else {
    setError('An unexpected error occurred');
  }
}
```

## Testing

Visit `/auth-demo` to test the authentication system:
- View current auth state
- Test login with existing credentials
- Test registration with new user
- Test logout
- Test auth refresh

## Security Considerations

- ✅ Passwords are never stored in frontend
- ✅ Tokens stored in localStorage (consider httpOnly cookies for production)
- ✅ Automatic token refresh minimizes re-authentication
- ✅ Apollo error link handles unauthorized errors globally
- ✅ Sensitive operations require backend validation

## Best Practices

1. **Always check `isLoading`** before rendering auth-dependent UI
2. **Handle errors gracefully** with try-catch blocks
3. **Use ProtectedRoute** for pages requiring authentication
4. **Check user roles** for feature access control
5. **Clear sensitive data** on logout
6. **Don't store passwords** in state or localStorage

## Integration with Apollo Client

The auth tokens are automatically added to GraphQL requests via Apollo's `authLink` middleware in `lib/apollo.ts`. No manual header management needed!

```typescript
// This happens automatically - no need to do anything!
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});
```

## Next Steps

After implementing AuthContext, you can proceed with:
- **Task 1.8**: Create Login page with React Hook Form
- **Task 1.9**: Create Register page
- **Task 1.10**: Create ProtectedRoute component

The AuthContext is now ready to power your authentication system! 🎉
