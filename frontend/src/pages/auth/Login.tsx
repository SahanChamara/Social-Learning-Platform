import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, BookOpen, Loader2, Sparkles, Trophy } from 'lucide-react';
import { useAuth } from '../../hooks';
import { useToast } from '../../hooks/useToast';
import { AnimatedPage, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, StatusBadge } from '../../components/ui';

const loginSchema = z.object({
  emailOrUsername: z.string().min(1, 'Email or username is required').trim(),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const from = (location.state as { from?: string })?.from || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { emailOrUsername: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      await login({ emailOrUsername: data.emailOrUsername, password: data.password });
      toast({ title: 'Login successful!', description: 'Welcome back to your learning workspace.' });
      navigate(from, { replace: true });
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Failed to log in. Please check your credentials.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = authLoading || isSubmitting;

  return (
    <AnimatedPage>
      <div className="app-container grid min-h-[calc(100vh-4rem)] gap-10 py-10 lg:grid-cols-[1fr_28rem] lg:items-center">
        <section className="hidden max-w-3xl lg:block">
          <StatusBadge tone="violet">
            <Sparkles className="h-3.5 w-3.5" />
            Return to your learning orbit
          </StatusBadge>
          <h1 className="mt-6 text-5xl font-black tracking-tight text-slate-50">
            Continue courses, discussions, streaks, and creator updates from one premium workspace.
          </h1>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="glass-panel rounded-xl p-5">
              <BookOpen className="h-6 w-6 text-cyan-200" />
              <p className="mt-4 font-semibold text-slate-50">Resume active paths</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">Jump back into the next lesson without losing context.</p>
            </div>
            <div className="glass-panel rounded-xl p-5">
              <Trophy className="h-6 w-6 text-amber-200" />
              <p className="mt-4 font-semibold text-slate-50">Keep progress visible</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">Streaks, badges, and completed lessons stay close.</p>
            </div>
          </div>
        </section>

        <div>
          <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-cyan-200">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <Card className="aurora-border">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-3xl font-bold">Welcome back</CardTitle>
              <CardDescription>Sign in to continue your learning momentum.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emailOrUsername">Email or username</Label>
                  <Input id="emailOrUsername" type="text" placeholder="you@example.com" error={errors.emailOrUsername?.message} disabled={isLoading} {...register('emailOrUsername')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Enter your password" error={errors.password?.message} disabled={isLoading} {...register('password')} />
                </div>

                <Button type="submit" variant="premium" className="w-full" disabled={isLoading}>
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

              <p className="mt-6 text-center text-sm text-slate-400">
                Don&apos;t have an account?{' '}
                <Link to="/auth/register" className="font-semibold text-cyan-200 transition hover:text-cyan-100">
                  Create an account
                </Link>
              </p>

              {import.meta.env.DEV && (
                <div className="mt-6 rounded-lg border border-slate-800 bg-slate-900/70 p-3 text-xs text-slate-400">
                  <p className="font-semibold text-slate-300">Demo Credentials</p>
                  <p className="mt-1">Email: demo@example.com</p>
                  <p>Password: password123</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AnimatedPage>
  );
}
