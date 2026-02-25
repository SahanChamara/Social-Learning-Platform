import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
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

// Zod validation schema for registration form
const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, 'Username is required')
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username must be less than 50 characters')
      .regex(
        /^\w+$/,
        'Username can only contain letters, numbers, and underscores'
      )
      .trim(),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address')
      .trim()
      .toLowerCase(),
    fullName: z
      .string()
      .min(1, 'Full name is required')
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name must be less than 100 characters')
      .trim(),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the Terms of Service and Privacy Policy',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const { register: registerUser, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      fullName: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      await registerUser({
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        password: data.password,
      });

      toast({
        title: 'Account created successfully!',
        description: 'Welcome to Social Learning Platform. Let\'s get started!',
      });

      // Redirect to dashboard after successful registration
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to create account. Please try again.';

      toast({
        title: 'Registration failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = authLoading || isSubmitting;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
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
            <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
            <CardDescription className="text-base">
              Join our learning community and start your journey today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username">
                  Username <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  error={errors.username?.message}
                  disabled={isLoading}
                  {...register('username')}
                />
                <p className="text-xs text-gray-500">
                  3-50 characters, letters, numbers, and underscores only
                </p>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  error={errors.email?.message}
                  disabled={isLoading}
                  {...register('email')}
                />
              </div>

              {/* Full Name Field */}
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  error={errors.fullName?.message}
                  disabled={isLoading}
                  {...register('fullName')}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  error={errors.password?.message}
                  disabled={isLoading}
                  {...register('password')}
                />
                <p className="text-xs text-gray-500">
                  Minimum 8 characters with uppercase, lowercase, and number
                </p>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirm Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  error={errors.confirmPassword?.message}
                  disabled={isLoading}
                  {...register('confirmPassword')}
                />
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <input
                    id="acceptTerms"
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50"
                    disabled={isLoading}
                    {...register('acceptTerms')}
                  />
                  <Label
                    htmlFor="acceptTerms"
                    className="text-sm font-normal leading-relaxed cursor-pointer"
                  >
                    I agree to the{' '}
                    <Link
                      to="/terms"
                      className="text-blue-600 hover:text-blue-700 underline"
                      target="_blank"
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      to="/privacy"
                      className="text-blue-600 hover:text-blue-700 underline"
                      target="_blank"
                    >
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
                {errors.acceptTerms && (
                  <p className="text-sm text-red-600" role="alert">
                    {errors.acceptTerms.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/auth/login"
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Benefits Section (Development only) */}
            {import.meta.env.DEV && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-center text-gray-500 mb-2">
                  What you'll get:
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Access to thousands of free courses
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Track your learning progress
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Earn achievements and badges
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Join a community of learners
                  </li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
