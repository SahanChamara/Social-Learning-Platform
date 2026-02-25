import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks';
import { useToast } from '../../hooks/useToast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';

// Zod validation schema for login form
const loginSchema = z.object({
  emailOrUsername: z
    .string()
    .min(1, 'Email or username is required')
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the redirect path from location state (for protected routes)
  const from = (location.state as { from?: string })?.from || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrUsername: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      await login({
        emailOrUsername: data.emailOrUsername,
        password: data.password,
      });

      toast({
        title: 'Login successful!',
        description: 'Welcome back to Social Learning Platform.',
      });

      // Redirect to the intended page or home
      navigate(from, { replace: true });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to log in. Please check your credentials.';

      toast({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = authLoading || isSubmitting;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Back to Home Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <Card>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-base">
              Sign in to your account to continue learning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email or Username Field */}
              <div className="space-y-2">
                <Label htmlFor="emailOrUsername">
                  Email or Username
                </Label>
                <Input
                  id="emailOrUsername"
                  type="text"
                  placeholder="Enter your email or username"
                  error={errors.emailOrUsername?.message}
                  disabled={isLoading}
                  {...register('emailOrUsername')}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/auth/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                    tabIndex={-1}
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  error={errors.password?.message}
                  disabled={isLoading}
                  {...register('password')}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/auth/register"
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Create an account
                </Link>
              </p>
            </div>

            {/* Demo Credentials (Development only) */}
            {import.meta.env.DEV && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-center text-gray-500 mb-2">
                  Demo Credentials (Development)
                </p>
                <div className="text-xs text-gray-600 bg-gray-50 rounded-md p-3 space-y-1">
                  <p>
                    <strong>Email:</strong> demo@example.com
                  </p>
                  <p>
                    <strong>Password:</strong> password123
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
