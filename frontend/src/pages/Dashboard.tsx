import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks';
import { LEARNING_STREAK_QUERY } from '../graphql';
import { LearningStreak } from '../components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  BookOpen,
  Flame,
  Award,
  Clock,
  User,
  Settings,
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

  const streak = streakData?.learningStreak ?? null;
  const currentStreak = streak?.currentStreakDays ?? 0;

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
    { label: 'Courses Enrolled', value: '12', icon: BookOpen, color: 'text-blue-600' },
    { label: 'In Progress', value: '5', icon: Clock, color: 'text-orange-600' },
    { label: 'Completed', value: '7', icon: Award, color: 'text-green-600' },
    {
      label: 'Learning Streak',
      value: streakLoading ? '...' : `${currentStreak} day${currentStreak === 1 ? '' : 's'}`,
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
              <Link to="/settings">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                  Settings
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
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Continue Learning</CardTitle>
              <CardDescription>Pick up where you left off</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">
                        Course Title {i}
                      </h4>
                      <p className="text-sm text-gray-600">Lesson {i * 3}/20</p>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(i * 3) * 5}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
              <CardDescription>Your latest milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'First Course Completed', icon: '🎓', date: '2 days ago' },
                  { name: '7-Day Streak', icon: '🔥', date: '5 days ago' },
                  { name: 'Quick Learner', icon: '⚡', date: '1 week ago' },
                ].map((achievement) => (
                  <div key={achievement.name} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-4xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{achievement.name}</h4>
                      <p className="text-sm text-gray-600">{achievement.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">🎉 You're on a Protected Route!</CardTitle>
            <CardDescription className="text-blue-700">
              This dashboard is only accessible to authenticated users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-blue-800">
              <p>
                <strong>Your Info:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Username: {user?.username}</li>
                <li>Email: {user?.email}</li>
                <li>Full Name: {user?.fullName}</li>
                <li>Role: {user?.role}</li>
                <li>Verified: {user?.isVerified ? 'Yes' : 'No'}</li>
              </ul>
              <p className="mt-4 pt-4 border-t border-blue-200">
                <strong>Try this:</strong> Log out and try to access this page directly. 
                You'll be redirected to the login page and then brought back here after logging in!
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
