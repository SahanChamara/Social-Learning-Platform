import { useState } from 'react';
import { useAuth } from '../contexts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label } from '../components/ui';
import { toast } from '../hooks/useToast';
import { Loader2, LogIn, LogOut, UserPlus, RefreshCw } from 'lucide-react';

export default function AuthDemo() {
  const { user, isAuthenticated, isLoading, login, register, logout, refreshAuth } = useAuth();
  
  // Login form state
  const [loginData, setLoginData] = useState({
    emailOrUsername: '',
    password: '',
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await login(loginData);
      toast({
        variant: 'success',
        title: 'Login Successful!',
        description: `Welcome back, ${user?.fullName}!`,
      });
      // Clear form
      setLoginData({ emailOrUsername: '', password: '' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid credentials. Please try again.';
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await register(registerData);
      toast({
        variant: 'success',
        title: 'Registration Successful!',
        description: `Welcome to Social Learning Platform, ${registerData.fullName}!`,
      });
      // Clear form
      setRegisterData({ username: '', email: '', password: '', fullName: '' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to create account. Please try again.';
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      await refreshAuth();
      toast({
        variant: 'success',
        title: 'Auth Refreshed',
        description: 'Authentication state has been refreshed.',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to refresh authentication.';
      toast({
        variant: 'destructive',
        title: 'Refresh Failed',
        description: errorMessage,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Auth Context Demo
          </h1>
          <p className="mt-2 text-gray-600">
            Testing authentication context with login, register, and logout
          </p>
        </div>

        {/* Current Auth State */}
        <Card>
          <CardHeader>
            <CardTitle>Current Authentication State</CardTitle>
            <CardDescription>
              Your current user information and auth status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Status:</span>
                <p className="text-lg font-semibold">
                  {isAuthenticated ? (
                    <span className="text-green-600">✓ Authenticated</span>
                  ) : (
                    <span className="text-gray-400">Not Authenticated</span>
                  )}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">User:</span>
                <p className="text-lg font-semibold">
                  {user ? user.username : 'None'}
                </p>
              </div>
            </div>

            {user && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Full Name:</strong> {user.fullName}</p>
                <p><strong>Role:</strong> <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">{user.role}</span></p>
                <p><strong>Verified:</strong> {user.isVerified ? '✓ Yes' : '✗ No'}</p>
                <p><strong>Active:</strong> {user.isActive ? '✓ Yes' : '✗ No'}</p>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              {isAuthenticated && (
                <Button onClick={handleLogout} variant="destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              )}
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Auth
              </Button>
            </div>
          </CardContent>
        </Card>

        {!isAuthenticated && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Login Form */}
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Sign in with your email or username
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email or Username</Label>
                    <Input
                      id="login-email"
                      type="text"
                      placeholder="Enter email or username"
                      value={loginData.emailOrUsername}
                      onChange={(e) =>
                        setLoginData({ ...loginData, emailOrUsername: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter password"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Login
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Register Form */}
            <Card>
              <CardHeader>
                <CardTitle>Register</CardTitle>
                <CardDescription>
                  Create a new account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Username</Label>
                    <Input
                      id="register-username"
                      type="text"
                      placeholder="Choose a username"
                      value={registerData.username}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, username: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Enter your email"
                      value={registerData.email}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-fullname">Full Name</Label>
                    <Input
                      id="register-fullname"
                      type="text"
                      placeholder="Enter your full name"
                      value={registerData.fullName}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, fullName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Choose a password"
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, password: e.target.value })
                      }
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Register
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Usage Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use AuthContext</CardTitle>
            <CardDescription>
              Integration guide for using authentication in your components
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. Import the hook:</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{`import { useAuth } from '@/contexts';`}</code>
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">2. Use in your component:</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{`const { user, isAuthenticated, login, logout } = useAuth();`}</code>
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">3. Available properties:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li><code className="bg-gray-100 px-1 rounded">user</code> - Current user object or null</li>
                <li><code className="bg-gray-100 px-1 rounded">isAuthenticated</code> - Boolean auth status</li>
                <li><code className="bg-gray-100 px-1 rounded">isLoading</code> - Loading state during auth check</li>
                <li><code className="bg-gray-100 px-1 rounded">login(input)</code> - Login function (async)</li>
                <li><code className="bg-gray-100 px-1 rounded">register(input)</code> - Register function (async)</li>
                <li><code className="bg-gray-100 px-1 rounded">logout()</code> - Logout function</li>
                <li><code className="bg-gray-100 px-1 rounded">refreshAuth()</code> - Refresh auth state (async)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
