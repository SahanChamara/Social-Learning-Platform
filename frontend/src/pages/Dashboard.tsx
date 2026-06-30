import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Link } from 'react-router-dom';
import { Award, BookOpen, Clock, Flame, GraduationCap, MessageSquare, Sparkles, Trophy } from 'lucide-react';
import { AchievementBadge, LearningStreak } from '../components';
import { LEARNING_STREAK_QUERY, MY_ACHIEVEMENTS_QUERY, MY_ENROLLMENTS_QUERY } from '../graphql';
import { useAuth } from '../hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { AnimatedPage, Button, EmptyState, PageHeader, Skeleton, StatusBadge } from '../components/ui';
import type { MyEnrollmentsResponse } from '../types/courses';

interface LearningStreakData {
  currentStreakDays: number;
  longestStreakDays: number;
  totalActiveDays: number;
  lastActivityDate?: string | null;
  streakStartDate?: string | null;
}

interface Achievement {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  iconUrl?: string | null;
  badgeColor?: string | null;
  points?: number | null;
}

interface UserAchievementData {
  id: string;
  achievement: Achievement;
  progressPercentage: number;
  isUnlocked: boolean;
  earnedAt?: string | null;
}

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

export default function Dashboard() {
  const { user } = useAuth();
  const [celebrationMilestone, setCelebrationMilestone] = useState<number | null>(null);

  const { data: streakData, loading: streakLoading } = useQuery<{
    learningStreak: LearningStreakData;
  }>(LEARNING_STREAK_QUERY, {
    skip: !user,
    fetchPolicy: 'cache-and-network',
  });

  const { data: enrollmentsData, loading: enrollmentsLoading } = useQuery<MyEnrollmentsResponse>(
    MY_ENROLLMENTS_QUERY,
    {
      skip: !user,
      fetchPolicy: 'cache-and-network',
    },
  );

  const { data: achievementsData, loading: achievementsLoading } = useQuery<{
    myAchievements: UserAchievementData[];
  }>(MY_ACHIEVEMENTS_QUERY, {
    skip: !user,
    fetchPolicy: 'cache-and-network',
  });

  const streak = streakData?.learningStreak ?? null;
  const currentStreak = streak?.currentStreakDays ?? 0;
  const enrollments = enrollmentsData?.myEnrollments ?? [];
  const achievements = achievementsData?.myAchievements ?? [];
  const completedEnrollments = enrollments.filter((enrollment) => enrollment.status === 'COMPLETED');
  const inProgressEnrollments = enrollments.filter((enrollment) => enrollment.status === 'ENROLLED');
  const unlockedAchievements = achievements.filter((achievement) => achievement.isUnlocked);
  const achievementPreview = achievements
    .filter((achievement) => achievement.isUnlocked || achievement.progressPercentage > 0)
    .sort((a, b) => {
      if (a.isUnlocked !== b.isUnlocked) {
        return a.isUnlocked ? -1 : 1;
      }
      return b.progressPercentage - a.progressPercentage;
    })
    .slice(0, 3);
  const totalLessonsCompleted = enrollments.reduce(
    (sum, enrollment) => sum + enrollment.completedLessons,
    0,
  );
  const totalStudyTimeMinutes = enrollments.reduce(
    (sum, enrollment) => sum + enrollment.timeSpentMinutes,
    0,
  );

  const nextMilestone = useMemo(
    () => STREAK_MILESTONES.find((milestone) => milestone > currentStreak),
    [currentStreak],
  );

  useEffect(() => {
    if (!user || !streak) {
      return;
    }

    const matchedMilestone = STREAK_MILESTONES.find(
      (milestone) => milestone === streak.currentStreakDays,
    );
    if (!matchedMilestone) {
      return;
    }

    const storageKey = `slp:streak-milestone:${user.id}:${matchedMilestone}`;
    if (localStorage.getItem(storageKey)) {
      return;
    }

    localStorage.setItem(storageKey, new Date().toISOString());
    window.setTimeout(() => setCelebrationMilestone(matchedMilestone), 0);
  }, [streak, user]);

  const stats = [
    {
      label: 'Courses enrolled',
      value: enrollmentsLoading ? <Skeleton className="h-8 w-14 rounded-md" /> : enrollments.length,
      icon: BookOpen,
      color: 'text-blue-600',
    },
    {
      label: 'In progress',
      value: enrollmentsLoading ? <Skeleton className="h-8 w-14 rounded-md" /> : inProgressEnrollments.length,
      icon: Clock,
      color: 'text-orange-600',
    },
    {
      label: 'Completed',
      value: enrollmentsLoading ? <Skeleton className="h-8 w-14 rounded-md" /> : completedEnrollments.length,
      icon: Award,
      color: 'text-emerald-600',
    },
    {
      label: 'Learning streak',
      value: streakLoading ? <Skeleton className="h-8 w-24 rounded-md" /> : `${currentStreak} day${currentStreak === 1 ? '' : 's'}`,
      icon: Flame,
      color: 'text-orange-600',
    },
  ];

  return (
    <AnimatedPage>
      <main className="app-container min-h-[calc(100vh-4.5rem)] py-10">
        <PageHeader
          eyebrow="Learning dashboard"
          title={`Welcome back, ${user?.fullName || user?.username || 'learner'}`}
          description="Track real course progress, streak consistency, and achievements earned through learning activity."
          actions={
            <Button asChild>
              <Link to="/my-learning">
                <GraduationCap className="h-4 w-4" />
                Continue Learning
              </Link>
            </Button>
          }
        />

        <section className="cinematic-section mb-8 rounded-3xl p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <StatusBadge tone="cyan">
                <Sparkles className="h-3.5 w-3.5" />
                today&apos;s learning mission
              </StatusBadge>
              <h2 className="mt-5 text-4xl font-black tracking-tight text-slate-50">
                Keep the streak alive with one focused lesson.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
                Continue a course, answer a discussion, and move your achievement progress forward from the same workspace.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/6 p-4">
                <Flame className="h-5 w-5 text-amber-200" />
                <p className="mt-5 text-2xl font-black text-slate-50">{currentStreak}</p>
                <p className="text-xs text-slate-400">day streak</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/6 p-4">
                <Trophy className="h-5 w-5 text-violet-200" />
                <p className="mt-5 text-2xl font-black text-slate-50">{unlockedAchievements.length}</p>
                <p className="text-xs text-slate-400">unlocked</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/6 p-4">
                <MessageSquare className="h-5 w-5 text-cyan-200" />
                <p className="mt-5 text-2xl font-black text-slate-50">{inProgressEnrollments.length}</p>
                <p className="text-xs text-slate-400">active paths</p>
              </div>
            </div>
          </div>
        </section>

        <AlertDialog.Root
          open={celebrationMilestone !== null}
          onOpenChange={(open) => {
            if (!open) {
              setCelebrationMilestone(null);
            }
          }}
        >
          <AlertDialog.Portal>
            <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
            <AlertDialog.Content className="glass-panel fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl p-6">
              <AlertDialog.Title className="text-xl font-bold text-slate-50">
                Streak milestone reached
              </AlertDialog.Title>
              <AlertDialog.Description className="mt-2 text-sm text-slate-400">
                You just hit a {celebrationMilestone}-day learning streak. Keep it going and unlock
                your next badge.
              </AlertDialog.Description>
              <div className="mt-5 flex justify-end">
                <AlertDialog.Action asChild>
                  <Button>Keep Going</Button>
                </AlertDialog.Action>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="mb-1 text-sm text-slate-400">{stat.label}</p>
                      <div className="min-h-8 text-2xl font-bold text-slate-50">{stat.value}</div>
                    </div>
                    <div className={`rounded-lg bg-slate-900 p-3 ${stat.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <LearningStreak streak={streak} loading={streakLoading} className="lg:col-span-2" />
          <Card>
            <CardHeader>
              <CardTitle>Next streak milestone</CardTitle>
              <CardDescription>
                {currentStreak > 0
                  ? `You're on a ${currentStreak}-day streak.`
                  : 'Start your streak today with one lesson.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-400">
                {nextMilestone
                  ? `Only ${nextMilestone - currentStreak} day${
                      nextMilestone - currentStreak === 1 ? '' : 's'
                    } to your next ${nextMilestone}-day milestone.`
                  : 'You are beyond the current milestone set.'}
              </p>
              <Button className="w-full" asChild>
                <Link to="/my-learning">Complete today&apos;s learning</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Continue learning</CardTitle>
              <CardDescription>Open your active courses and choose the next lesson.</CardDescription>
            </CardHeader>
            <CardContent>
              {inProgressEnrollments.length > 0 ? (
                <div className="space-y-4">
                  {inProgressEnrollments.slice(0, 3).map((enrollment) => (
                    <Link
                      key={enrollment.id}
                      to="/my-learning"
                      className="block rounded-lg border border-slate-800 bg-slate-950/45 p-4 transition hover:border-cyan-300/40 hover:bg-slate-900/70"
                    >
                      <h4 className="font-semibold text-slate-50">{enrollment.course.title}</h4>
                      <div className="mt-2 flex items-center justify-between text-sm text-slate-400">
                        <span>
                          {enrollment.completedLessons} of {enrollment.totalLessons} lessons
                        </span>
                        <span className="font-medium text-cyan-200">{enrollment.progressPercentage}%</span>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-slate-800">
                        <div
                          className="h-2 rounded-full bg-linear-to-r from-cyan-300 to-violet-400"
                          style={{ width: `${enrollment.progressPercentage}%` }}
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No active courses yet"
                  description="Enroll in a course to start tracking progress here."
                  action={
                    <Button asChild>
                      <Link to="/courses">Browse Courses</Link>
                    </Button>
                  }
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Learning summary</CardTitle>
              <CardDescription>Your real activity across enrolled courses.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                  <p className="text-sm text-slate-400">Lessons completed</p>
                  <p className="mt-1 text-2xl font-bold text-slate-50">{totalLessonsCompleted}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                  <p className="text-sm text-slate-400">Study time</p>
                  <p className="mt-1 text-2xl font-bold text-slate-50">{totalStudyTimeMinutes}m</p>
                </div>
              </div>
              <Button variant="outline" className="mt-4 w-full" asChild>
                <Link to="/my-learning">View My Learning</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Achievement progress</CardTitle>
                <CardDescription>
                  {achievementsLoading
                    ? 'Loading achievement progress...'
                    : `${unlockedAchievements.length} of ${achievements.length} achievements unlocked`}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/profile">
                  <Trophy className="h-4 w-4" />
                  View all
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {achievementsLoading ? (
              <div className="grid gap-4 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-36 rounded-xl" />
                ))}
              </div>
            ) : achievementPreview.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-3">
                {achievementPreview.map((userAchievement) => (
                  <AchievementBadge
                    key={userAchievement.id}
                    achievement={userAchievement.achievement}
                    unlocked={userAchievement.isUnlocked}
                    progressPercentage={userAchievement.progressPercentage}
                    earnedAt={userAchievement.earnedAt}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No achievement progress yet"
                description="Complete lessons and keep learning to start unlocking achievements."
                icon={<Award className="h-6 w-6" />}
                action={
                  <Button asChild>
                    <Link to="/my-learning">Open My Learning</Link>
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      </main>
    </AnimatedPage>
  );
}
