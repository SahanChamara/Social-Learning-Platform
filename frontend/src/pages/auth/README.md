# Authentication Pages

This directory contains the authentication pages for the Social Learning Platform.

## Login Page (`Login.tsx`)

**Status:** ✅ Complete (Task 1.8)

### Features

- **React Hook Form Integration**: Form state management with automatic validation
- **Zod Validation Schema**: Type-safe validation with clear error messages
- **Authentication**: Integration with `useAuth` hook from AuthContext
- **Error Handling**: Toast notifications for success/failure
- **Loading States**: Disabled inputs and spinner during submission
- **Smart Redirects**: Redirects to intended destination after login (for protected routes)
- **Responsive Design**: Mobile-first, beautiful gradient background
- **Accessibility**: Proper labels, ARIA attributes, keyboard navigation

### Validation Rules

- **Email/Username**: Required, minimum 1 character (trimmed)
- **Password**: Required, minimum 6 characters

### Form Fields

1. **Email or Username** (`emailOrUsername`)
   - Accepts both email addresses and usernames
   - Flexible authentication method

2. **Password** (`password`)
   - Secure password input
   - Minimum 6 characters

### Navigation Links

- **Forgot Password**: `/auth/forgot-password` (stub, to be implemented)
- **Register**: `/auth/register` (Task 1.9)
- **Back to Home**: `/` (Home page)

### Usage Example

```tsx
// Users are automatically redirected after successful login
// From a ProtectedRoute:
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />

// If not authenticated, user is sent to /auth/login
// After logging in, they're redirected back to /dashboard
```

### Developer Notes

#### Demo Credentials
In development mode, demo credentials are displayed on the page:
- **Email**: demo@example.com
- **Password**: password123

This section is hidden in production builds.

#### Location State
The login page checks for `location.state.from` to redirect users back to their intended destination after authentication. This is useful for protected routes.

```tsx
// When redirecting to login from a protected route:
navigate('/auth/login', { state: { from: location.pathname } });
```

#### Toast Notifications
Success and error messages are displayed using the toast system:
- **Success**: "Login successful! Welcome back to Social Learning Platform."
- **Error**: Displays the specific error message from the backend

### Dependencies

- `react-hook-form` - Form state management
- `zod` - Schema validation
- `@hookform/resolvers/zod` - Zod resolver for React Hook Form
- `react-router-dom` - Navigation
- `lucide-react` - Icons (Loader2, ArrowLeft)

### Components Used

- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` - Layout
- `Button` - Submit button with loading state
- `Input` - Text inputs with error display
- `Label` - Accessible form labels

### Testing

To test the login page:

1. **Navigate to the page**: http://localhost:5173/auth/login
2. **Try validation errors**:
   - Submit empty form (should show "required" errors)
   - Enter short password (should show min length error)
3. **Try authentication**:
   - Enter demo credentials (or register a new account)
   - Should show loading spinner during submission
   - Should redirect to home/dashboard on success
   - Should show toast notification

### Integration with AuthContext

The login page uses the `login` function from `useAuth()`:

```tsx
const { login, isLoading } = useAuth();

await login({
  emailOrUsername: data.emailOrUsername,
  password: data.password,
});
```

This triggers:
1. LOGIN_MUTATION GraphQL call
2. Token storage in localStorage
3. User state update in AuthContext
4. Apollo cache update

### Future Enhancements

- [ ] Add "Remember Me" checkbox to persist login longer
- [ ] Add password visibility toggle (eye icon)
- [ ] Implement Forgot Password functionality
- [ ] Add social login options (Google, GitHub)
- [ ] Add email verification requirement
- [ ] Add CAPTCHA for security
- [ ] Add login attempt rate limiting UI feedback

---

## Register Page (`Register.tsx`)

**Status:** ✅ Complete (Task 1.9)

### Features

- **React Hook Form Integration**: Comprehensive form state management
- **Advanced Zod Validation**: Password strength, email format, username pattern, password confirmation
- **Authentication**: Integration with `useAuth` hook from AuthContext
- **Error Handling**: Toast notifications for success/failure
- **Loading States**: Disabled inputs and spinner during submission
- **Terms Acceptance**: Required checkbox for Terms of Service and Privacy Policy
- **Password Matching**: Client-side validation for password confirmation
- **Responsive Design**: Mobile-first with purple-blue gradient background
- **Accessibility**: Proper labels, ARIA attributes, required field indicators

### Validation Rules

- **Username**: 
  - Required
  - 3-50 characters
  - Letters, numbers, and underscores only (no spaces)
  - Trimmed automatically
- **Email**: 
  - Required
  - Valid email format
  - Converted to lowercase
  - Trimmed automatically
- **Full Name**: 
  - Required
  - Minimum 2 characters
  - Maximum 100 characters
  - Trimmed automatically
- **Password**: 
  - Required
  - Minimum 8 characters
  - Must contain at least one uppercase letter
  - Must contain at least one lowercase letter
  - Must contain at least one number
- **Confirm Password**: 
  - Required
  - Must match the password field exactly
- **Accept Terms**: 
  - Must be checked to submit

### Form Fields

1. **Username** (`username`)
   - Unique identifier for the user
   - Pattern: alphanumeric with underscores
   - Example: `johndoe`, `jane_smith123`

2. **Email Address** (`email`)
   - Primary contact and login method
   - Must be valid email format
   - Example: `john@example.com`

3. **Full Name** (`fullName`)
   - User's display name
   - Example: `John Doe`

4. **Password** (`password`)
   - Secure password with complexity requirements
   - Not shown in plain text

5. **Confirm Password** (`confirmPassword`)
   - Must match the password field
   - Client-side validation

6. **Accept Terms** (`acceptTerms`)
   - Required checkbox
   - Links to Terms of Service and Privacy Policy

### Navigation Links

- **Sign in**: `/auth/login` (Task 1.8)
- **Terms of Service**: `/terms` (future)
- **Privacy Policy**: `/privacy` (future)
- **Back to Home**: `/` (Home page)

### Usage Example

```tsx
// Register a new user
const handleRegister = async () => {
  await register({
    username: 'johndoe',
    email: 'john@example.com',
    fullName: 'John Doe',
    password: 'SecurePass123',
  });
  // User is automatically logged in after registration
  // Redirected to home page
};
```

### Developer Notes

#### Password Strength Requirements

The password must meet all of the following criteria:
- Minimum 8 characters long
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)

This ensures reasonable password security while not being overly restrictive.

#### Username Validation

Usernames are validated with a regex pattern: `/^\w+$/` (word characters only)
- Allows: letters (a-z, A-Z), numbers (0-9), underscores (_)
- Disallows: spaces, special characters, emojis

#### Benefits Section (Dev Only)

In development mode, a benefits section is displayed showing:
- Access to thousands of free courses
- Track your learning progress
- Earn achievements and badges
- Join a community of learners

This section is hidden in production builds.

#### Redirect After Registration

After successful registration, users are:
1. Automatically logged in
2. Redirected to the home page (/)
3. Can be changed to redirect to `/onboarding` or `/dashboard` if needed

```tsx
navigate('/', { replace: true });
```

### Toast Notifications

Success and error messages:
- **Success**: "Account created successfully! Welcome to Social Learning Platform. Let's get started!"
- **Error**: Displays specific error from backend (e.g., "Email already exists", "Username is taken")

### Integration with AuthContext

The register page uses the `register` function from `useAuth()`:

```tsx
const { register: registerUser, isLoading } = useAuth();

await registerUser({
  username: data.username,
  email: data.email,
  fullName: data.fullName,
  password: data.password,
});
```

This triggers:
1. REGISTER_MUTATION GraphQL call
2. Token storage in localStorage (user is logged in automatically)
3. User state update in AuthContext
4. Apollo cache update

### Testing

To test the register page:

1. **Navigate to the page**: http://localhost:5173/auth/register
2. **Try validation errors**:
   - Submit empty form → All fields show "required" errors
   - Enter username with spaces → "can only contain letters, numbers, and underscores"
   - Enter short password (< 8 chars) → "must be at least 8 characters"
   - Enter weak password (no uppercase/lowercase/number) → "must contain at least one uppercase letter..."
   - Enter mismatched passwords → "Passwords don't match" on confirm field
   - Submit without accepting terms → "You must accept the Terms of Service..."
3. **Try valid registration**:
   - Fill all fields correctly
   - Accept terms
   - Should show loading spinner
   - Should display success toast
   - Should redirect to home page
   - Should be logged in automatically

### Expected Behaviors

- **Valid submission**: Loading spinner → Toast → Auto-login → Redirect
- **Duplicate email**: Error toast "Email already exists"
- **Duplicate username**: Error toast "Username is already taken"
- **Network error**: Error toast with connection message
- **Form validation**: Inline error messages below each field

### Error Handling

The register page handles various error scenarios:
- **Validation errors**: Shown inline below fields with red text
- **Network errors**: "Failed to connect to server"
- **Duplicate email**: "Email already exists"
- **Duplicate username**: "Username is already taken"
- **Backend errors**: Displays specific error message from server
- **Terms not accepted**: "You must accept the Terms of Service and Privacy Policy"

### Future Enhancements

- [ ] Add username availability checker (real-time)
- [ ] Add email availability checker (real-time)
- [ ] Add password strength indicator with visual meter
- [ ] Add password visibility toggle (eye icon)
- [ ] Implement email verification flow
- [ ] Add social registration (Google, GitHub)
- [ ] Add CAPTCHA for bot prevention
- [ ] Add profile picture upload during registration
- [ ] Multi-step registration wizard
- [ ] Onboarding flow after registration

---

## Implementation Notes

### Authentication Flow

1. User enters credentials
2. Form validates input (Zod schema)
3. If valid, calls `login()` from AuthContext
4. AuthContext calls LOGIN_MUTATION GraphQL
5. On success:
   - Tokens stored in localStorage
   - User state updated
   - Toast notification shown
   - Redirect to intended page
6. On error:
   - Toast notification with error message
   - Form remains editable

### Error Handling

The login page handles various error scenarios:
- **Validation errors**: Shown inline below fields
- **Network errors**: "Failed to connect to server"
- **Invalid credentials**: "Invalid email/username or password"
- **Account inactive**: "Your account has been deactivated"
- **Backend errors**: Displays specific error message from server

### Accessibility

- All form inputs have associated labels
- Error messages have `role="alert"` for screen readers
- Keyboard navigation works throughout
- Focus states are clearly visible
- Color contrast meets WCAG standards

---

## ProtectedRoute Component (`../../components/auth/ProtectedRoute.tsx`)

**Status:** ✅ Complete (Task 1.10)

### Overview

The `ProtectedRoute` component is a route guard that ensures only authenticated and authorized users can access protected routes. It integrates seamlessly with the authentication system and provides loading states, smart redirects, and role-based access control.

### Features

- **Authentication Check**: Verifies user is logged in before rendering content
- **Loading State**: Shows spinner while verifying authentication
- **Smart Redirects**: Preserves intended destination for post-login navigation
- **Role-Based Access Control**: Optional restrictions by user role(s)
- **Graceful Error Handling**: User-friendly "Access Denied" page
- **Flexible Authorization**: Single required role or multiple allowed roles
- **TypeScript Integration**: Fully typed with proper interfaces

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `ReactNode` | ✅ Yes | - | The component(s) to render if authorized |
| `requiredRole` | `UserRole` | ❌ No | `undefined` | Single role required for access |
| `allowedRoles` | `UserRole[]` | ❌ No | `undefined` | Array of roles allowed access |
| `redirectTo` | `string` | ❌ No | `'/auth/login'` | Path to redirect unauthenticated users |

### Usage Examples

#### Basic Authentication Guard

Require authentication but allow any role:

```tsx
import { ProtectedRoute } from '@/components/auth';
import Dashboard from '@/pages/Dashboard';

// In router configuration
{
  path: 'dashboard',
  element: (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  ),
}
```

#### Single Required Role

Restrict to a specific role:

```tsx
import { ProtectedRoute } from '@/components/auth';
import { UserRole } from '@/types/auth';
import AdminPanel from '@/pages/AdminPanel';

// In router configuration
{
  path: 'admin',
  element: (
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
      <AdminPanel />
    </ProtectedRoute>
  ),
}
```

#### Multiple Allowed Roles

Allow access for multiple roles:

```tsx
import { ProtectedRoute } from '@/components/auth';
import { UserRole } from '@/types/auth';
import CreatorDashboard from '@/pages/CreatorDashboard';

// In router configuration
{
  path: 'create',
  element: (
    <ProtectedRoute allowedRoles={[UserRole.CREATOR, UserRole.ADMIN]}>
      <CreatorDashboard />
    </ProtectedRoute>
  ),
}
```

#### Custom Redirect Path

Specify a different redirect location:

```tsx
import { ProtectedRoute } from '@/components/auth';
import Settings from '@/pages/Settings';

// In router configuration
{
  path: 'settings',
  element: (
    <ProtectedRoute redirectTo="/auth/register">
      <Settings />
    </ProtectedRoute>
  ),
}
```

### Implementation Details

#### Three States Handled

1. **Loading State**
   - Shows while `isLoading` is true
   - Displays centered spinner with "Loading..." message
   - Prevents flash of incorrect content

2. **Not Authenticated**
   - Redirects to `redirectTo` (default: `/auth/login`)
   - Preserves intended destination in `location.state.from`
   - After login, user is automatically redirected back

3. **Authenticated**
   - If `requiredRole` specified: checks exact role match
   - If `allowedRoles` specified: checks role is in array
   - If authorized: renders `children`
   - If unauthorized: shows "Access Denied" page

#### Access Denied Page

When a user is authenticated but lacks required role:

- 🚫 Red emoji indicator
- Clear "Access Denied" heading
- Explanation of permission issue
- Shows required vs actual role
- "Go Back" button (uses `globalThis.history.back()`)
- Fallback redirect to home page

### How It Works

```tsx
// 1. Component checks authentication status
const { user, isAuthenticated, isLoading } = useAuth();

// 2. While loading, show spinner
if (isLoading) return <LoadingSpinner />;

// 3. Not authenticated? Redirect to login
if (!isAuthenticated) {
  return <Navigate to="/auth/login" state={{ from: location.pathname }} />;
}

// 4. Check role requirements
if (requiredRole && user?.role !== requiredRole) {
  return <AccessDenied />;
}

// 5. All checks passed? Render children
return <>{children}</>;
```

### Integration with Router

See [router.tsx](../../router.tsx) for complete integration:

```tsx
import { ProtectedRoute } from '@/components/auth';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';

const router = createBrowserRouter([
  {
    path: '/',
    children: [
      // ... public routes ...
      
      // Protected routes
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
```

### Testing Scenarios

1. **Unauthenticated Access**
   - Visit `/dashboard` while logged out
   - Should redirect to `/auth/login`
   - After login, should redirect back to `/dashboard`

2. **Authenticated Access**
   - Login as any user
   - Visit `/dashboard`
   - Should render Dashboard component

3. **Role-Based Restriction**
   - Login as LEARNER role
   - Visit `/admin` (requires ADMIN role)
   - Should show "Access Denied" page with role mismatch

4. **Loading State**
   - Refresh page while on protected route
   - Should briefly show loading spinner
   - Then render content or redirect

5. **Multiple Allowed Roles**
   - Set `allowedRoles={[UserRole.CREATOR, UserRole.ADMIN]}`
   - Login as CREATOR → should have access
   - Login as LEARNER → should see "Access Denied"

### Security Considerations

1. **Frontend Protection Only**: This component prevents UI rendering but does NOT secure your API
2. **Always Validate Backend**: Server must validate authentication and authorization
3. **Token Verification**: AuthContext handles token validation
4. **Role Checks**: User role from JWT is trusted (backend must ensure integrity)
5. **Navigation Guards**: React Router's `<Navigate>` with `replace` prevents back-button issues

### Related Files

- [`../../contexts/AuthContext.tsx`](../../contexts/AuthContext.tsx) - Provides authentication state
- [`../../hooks/useAuth.ts`](../../hooks/useAuth.ts) - Hook used by ProtectedRoute
- [`../../types/auth.ts`](../../types/auth.ts) - UserRole definition
- [`../../router.tsx`](../../router.tsx) - Router configuration with protected routes

### Future Enhancements

- Add transition animations for Access Denied page
- Create breadcrumbs showing navigation path
- Add "Request Access" functionality
- Extract UnauthorizedPage as separate component
- Add analytics for denied access attempts
- Support permission-based checks (in addition to roles)
- Add unit tests for all authorization scenarios

---

## Best Practices

1. **Always validate on the frontend**: Provides immediate feedback
2. **But also validate on the backend**: Security and data integrity
3. **Show clear error messages**: Help users understand what went wrong
4. **Disable form during submission**: Prevent duplicate requests
5. **Provide loading feedback**: Visual indication of processing
6. **Redirect after success**: Don't leave users on auth pages
7. **Handle edge cases**: Network failures, timeouts, etc.

---

## Related Files

- [`../../contexts/AuthContext.tsx`](../../contexts/AuthContext.tsx) - Authentication context provider
- [`../../hooks/useAuth.ts`](../../hooks/useAuth.ts) - Custom hook for auth operations
- [`../../graphql/auth.ts`](../../graphql/auth.ts) - GraphQL operations
- [`../../types/auth.ts`](../../types/auth.ts) - TypeScript types
- [`../../components/ui/`](../../components/ui/) - Reusable UI components

---

Last updated: Task 1.10 completion (February 2026)
