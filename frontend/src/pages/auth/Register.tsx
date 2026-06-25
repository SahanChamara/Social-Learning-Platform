import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks';
import { useToast } from '../../hooks/useToast';
import { AnimatedPage, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, StatusBadge } from '../../components/ui';

const registerSchema = z
  .object({
    username: z.string().min(1, 'Username is required').min(3, 'Username must be at least 3 characters').max(50, 'Username must be less than 50 characters').regex(/^\w+$/, 'Username can only contain letters, numbers, and underscores').trim(),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address').trim().toLowerCase(),
    fullName: z.string().min(1, 'Full name is required').min(2, 'Full name must be at least 2 characters').max(100, 'Full name must be less than 100 characters').trim(),
    password: z.string().min(1, 'Password is required').min(8, 'Password must be at least 8 characters').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and a number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptTerms: z.boolean().refine((val) => val === true, { message: 'You must accept the Terms of Service and Privacy Policy' }),
  })
  .refine((data) => data.password === data.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });

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
    defaultValues: { username: '', email: '', fullName: '', password: '', confirmPassword: '', acceptTerms: false },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      await registerUser({ username: data.username, email: data.email, fullName: data.fullName, password: data.password });
      toast({ title: 'Account created successfully!', description: "Welcome to LearnVerse. Let's get started!" });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'Failed to create account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = authLoading || isSubmitting;
  const benefits = ['Discover practical courses', 'Track progress and streaks', 'Join course discussions', 'Publish as a creator later'];

  return (
    <AnimatedPage>
      <div className="app-container grid min-h-[calc(100vh-4rem)] gap-10 py-10 lg:grid-cols-[1fr_30rem] lg:items-center">
        <section className="hidden max-w-3xl lg:block">
          <StatusBadge tone="cyan">
            <Sparkles className="h-3.5 w-3.5" />
            Build your learning identity
          </StatusBadge>
          <h1 className="mt-6 text-5xl font-black tracking-tight text-slate-50">
            Create a polished learning workspace that grows with every lesson you finish.
          </h1>
          <div className="mt-8 grid gap-3">
            {benefits.map((benefit) => (
              <div key={benefit} className="glass-panel flex items-center gap-3 rounded-xl p-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                <span className="font-semibold text-slate-100">{benefit}</span>
              </div>
            ))}
          </div>
        </section>

        <div>
          <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-cyan-200">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <Card className="aurora-border">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-3xl font-bold">Create account</CardTitle>
              <CardDescription>Join the learning community and start your first path.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" type="text" placeholder="johndoe" error={errors.username?.message} disabled={isLoading} {...register('username')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full name</Label>
                    <Input id="fullName" type="text" placeholder="John Doe" error={errors.fullName?.message} disabled={isLoading} {...register('fullName')} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" type="email" placeholder="john@example.com" error={errors.email?.message} disabled={isLoading} {...register('email')} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="Strong password" error={errors.password?.message} disabled={isLoading} {...register('password')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm password</Label>
                    <Input id="confirmPassword" type="password" placeholder="Confirm password" error={errors.confirmPassword?.message} disabled={isLoading} {...register('confirmPassword')} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <input
                      id="acceptTerms"
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-950 text-cyan-300 focus:ring-2 focus:ring-cyan-300 disabled:opacity-50"
                      disabled={isLoading}
                      {...register('acceptTerms')}
                    />
                    <Label htmlFor="acceptTerms" className="cursor-pointer text-sm font-normal leading-relaxed text-slate-400">
                      I agree to the Terms of Service and Privacy Policy
                    </Label>
                  </div>
                  {errors.acceptTerms && <p className="text-sm text-red-300">{errors.acceptTerms.message}</p>}
                </div>

                <Button type="submit" variant="premium" className="w-full" disabled={isLoading}>
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

              <p className="mt-6 text-center text-sm text-slate-400">
                Already have an account?{' '}
                <Link to="/auth/login" className="font-semibold text-cyan-200 transition hover:text-cyan-100">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AnimatedPage>
  );
}
