import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks';
import { LEARNING_STREAK_QUERY, MY_ENROLLMENTS_QUERY } from '../graphql';
import { LearningStreak } from '../components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui';
import type { MyEnrollmentsResponse } from '../types/courses';
import {
  BookOpen,
  Flame,
  Award,
  Clock,
  User,
  LogOut,
  GraduationCap
} from 'lucide-react';

interface LearningStreakData {
  currentStreakDays: number;
  longestStreakDays: number;
  totalActiveDays: number;
  lastActivityDate?: string | null;
  streakStartDate?: string | null;
}

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

export default function Dashboard() {
  const { user, logout } = useAuth();
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

  const streak = streakData?.learningStreak ?? null;
  const currentStreak = streak?.currentStreakDays ?? 0;
  const enrollments = enrollmentsData?.myEnrollments ?? [];
  const completedEnrollments = enrollments.filter((enrollment) => enrollment.status === 'COMPLETED');
  const inProgressEnrollments = enrollments.filter((enrollment) => enrollment.status === 'ENROLLED');

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
    setCelebrationMilestone(matchedMilestone);
  }, [streak, user]);

  const stats = [
    {
      label: 'Courses Enrolled',
      value: enrollmentsLoading ? <Skeleton className="h-8 w-14 rounded-md" /> : enrollments.length,
      icon: BookOpen,
      color: 'text-blue-600',
    },
    {
      label: 'In Progress',
      value: enrollmentsLoading ? <Skeleton className="h-8 w-14 rounded-md" /> : inProgressEnrollments.length,
      icon: Clock,
      color: 'text-orange-600',
    },
    {
      label: 'Completed',
      value: enrollmentsLoading ? <Skeleton className="h-8 w-14 rounded-md" /> : completedEnrollments.length,
      icon: Award,
      color: 'text-green-600',
    },
    {
      label: 'Learning Streak',
      value: streakLoading ? <Skeleton className="h-8 w-24 rounded-md" /> : `${currentStreak} day${currentStreak === 1 ? '' : 's'}`,
      icon: Flame,
      color: 'text-purple-600',
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user?.fullName || user?.username}!
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/my-learning">
                <Button variant="outline" size="sm">
                  <GraduationCap className="h-4 w-4" />
                  My Learning
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4" />
                  Profile
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AlertDialog.Root
          open={celebrationMilestone !== null}
          onOpenChange={(open) => {
            if (!open) {
              setCelebrationMilestone(null);
            }
          }}
        >
          <AlertDialog.Portal>
            <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
            <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-orange-200 bg-white p-6 shadow-xl">
              <AlertDialog.Title className="text-xl font-bold text-slate-900">
                🔥 Streak milestone reached!
              </AlertDialog.Title>
              <AlertDialog.Description className="mt-2 text-sm text-slate-600">
                Amazing consistency — you just hit a {celebrationMilestone}-day learning streak.
                Keep it going and unlock your next badge.
              </AlertDialog.Description>
              <div className="mt-5 flex justify-end">
                <AlertDialog.Action asChild>
                  <Button>Keep Going</Button>
                </AlertDialog.Action>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                      <div className="min-h-8">{stat.value}</div>
                    </div>
                    <div className={`p-3 rounded-lg bg-gray-100 ${stat.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
          <LearningStreak streak={streak} loading={streakLoading} className="lg:col-span-2" />
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="text-purple-900">Daily Motivation</CardTitle>
              <CardDescription className="text-purple-700">
                {currentStreak > 0
                  ? `You're on a ${currentStreak}-day streak.`
                  : 'Start your streak today with one lesson.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-purple-800">
                {nextMilestone
                  ? `Only ${nextMilestone - currentStreak} day${
                      nextMilestone - currentStreak === 1 ? '' : 's'
                    } to your next ${nextMilestone}-day milestone.`
                  : 'You are beyond all current streak milestones. Keep inspiring everyone!'}
              </p>
              <Link to="/my-learning">
                <Button className="w-full">Complete today&apos;s learning</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Continue Learning</CardTitle>
              <CardDescription>Open your active courses and choose the next lesson</CardDescription>
            </CardHeader>
            <CardContent>
              {inProgressEnrollments.length > 0 ? (
                <div className="space-y-4">
                  {inProgressEnrollments.slice(0, 3).map((enrollment) => (
                    <Link
                      key={enrollment.id}
                      to="/my-learning"
                      className="block rounded-lg bg-gray-50 p-4 transition hover:bg-gray-100"
                    >
                      <h4 className="font-semibold text-gray-900">{enrollment.course.title}</h4>
                      <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                        <span>
                          {enrollment.completedLessons} of {enrollment.totalLessons} lessons
                        </span>
                        <span className="font-medium text-blue-700">{enrollment.progressPercentage}%</span>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-blue-600"
                          style={{ width: `${enrollment.progressPercentage}%` }}
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
                  <p className="text-sm text-gray-600">No active courses yet.</p>
                  <Link to="/courses">
                    <Button className="mt-4">Browse Courses</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Learning Summary</CardTitle>
              <CardDescription>Your progress across enrolled courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-600">Lessons Completed</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {enrollments.reduce((sum, enrollment) => sum + enrollment.completedLessons, 0)}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-600">Study Time</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {enrollments.reduce((sum, enrollment) => sum + enrollment.timeSpentMinutes, 0)}m
                  </p>
                </div>
              </div>
              <Link to="/my-learning">
                <Button variant="outline" className="mt-4 w-full">View My Learning</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
