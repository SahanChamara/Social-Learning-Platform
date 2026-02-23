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

**Status:** 🚧 Placeholder (Task 1.9 - Next)

The register page will be implemented in Task 1.9 with similar features to the login page, plus:
- Additional fields: username, email, fullName, password
- Password confirmation validation
- Terms of Service acceptance
- Email uniqueness validation
- Username availability checking

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

Last updated: Task 1.8 completion (February 2026)
