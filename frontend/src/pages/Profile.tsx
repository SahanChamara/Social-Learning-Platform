import { useQuery } from '@apollo/client/react';
import { Link } from 'react-router-dom';
import {
  Award,
  Calendar,
  CheckCircle2,
  Mail,
  Shield,
  Trophy,
  User,
} from 'lucide-react';
import { AchievementBadge, LearningStreak, type LearningStreakData } from '../components';
import { EmptyState, PageHeader, Skeleton } from '../components/ui';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { LEARNING_STREAK_QUERY, MY_ACHIEVEMENTS_QUERY } from '../graphql';
import { useAuth } from '../hooks';

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
  createdAt: string;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

function initialsFromName(name: string, fallback: string) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return initials || fallback.slice(0, 2).toUpperCase();
}

export default function Profile() {
  const { user } = useAuth();

  const { data: achievementsData, loading: achievementsLoading } = useQuery<{
    myAchievements: UserAchievementData[];
  }>(MY_ACHIEVEMENTS_QUERY, {
    skip: !user,
    fetchPolicy: 'cache-and-network',
  });

  const { data: streakData, loading: streakLoading } = useQuery<{
    learningStreak: LearningStreakData;
  }>(LEARNING_STREAK_QUERY, {
    skip: !user,
    fetchPolicy: 'cache-and-network',
  });

  if (!user) {
    return null;
  }

  const myAchievements = achievementsData?.myAchievements ?? [];
  const unlockedAchievements = myAchievements.filter((achievement) => achievement.isUnlocked);
  const inProgressAchievements = myAchievements.filter((achievement) => !achievement.isUnlocked);
  const totalPoints = unlockedAchievements.reduce(
    (sum, userAchievement) => sum + (userAchievement.achievement.points ?? 0),
    0,
  );
  const streak = streakData?.learningStreak;
  const details = [
    { label: 'Username', value: user.username, icon: User },
    { label: 'Email', value: user.email, icon: Mail },
    { label: 'Role', value: user.role, icon: Shield },
    { label: 'Joined', value: formatDate(user.createdAt), icon: Calendar },
  ];

  return (
    <div className="bg-slate-50">
      <main className="app-container py-10">
        <PageHeader
          eyebrow="Profile"
          title={user.fullName}
          description="Your account identity, learning streak, and achievement progress."
          actions={
            <Button variant="outline" asChild>
              <Link to="/dashboard">Back to Dashboard</Link>
            </Button>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <section className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Core account details used across the learning platform.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                  <div className="shrink-0">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.fullName}
                        className="h-24 w-24 rounded-full border-4 border-slate-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-slate-200 bg-blue-600 text-3xl font-bold text-white">
                        {initialsFromName(user.fullName, user.username)}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-bold text-slate-950">{user.fullName}</h2>
                      {user.isVerified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Verified
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">@{user.username}</p>

                    {user.bio ? <p className="mt-4 leading-7 text-slate-700">{user.bio}</p> : null}
                    {user.expertise ? (
                      <p className="mt-3 text-sm text-slate-600">
                        <span className="font-semibold text-slate-900">Expertise:</span> {user.expertise}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-2">
                  {details.map((detail) => {
                    const Icon = detail.icon;
                    return (
                      <div key={detail.label} className="flex items-start gap-3 rounded-lg bg-slate-50 p-4">
                        <Icon className="mt-0.5 h-5 w-5 text-slate-500" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-500">{detail.label}</p>
                          <p className="mt-1 truncate text-sm font-semibold text-slate-950">{detail.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <LearningStreak streak={streak} loading={streakLoading} />

            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle>Achievements</CardTitle>
                    <CardDescription>
                      {achievementsLoading
                        ? 'Loading achievements...'
                        : `${unlockedAchievements.length} unlocked, ${inProgressAchievements.length} in progress`}
                    </CardDescription>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                    <Trophy className="h-4 w-4" />
                    {totalPoints} pts
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {achievementsLoading ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <div key={index} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                        <Skeleton className="mx-auto h-12 w-12 rounded-full" />
                        <Skeleton className="mx-auto mt-3 h-4 w-24" />
                        <Skeleton className="mt-3 h-1.5 w-full rounded-full" />
                        <Skeleton className="mx-auto mt-2 h-3 w-16" />
                      </div>
                    ))}
                  </div>
                ) : myAchievements.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {myAchievements.map((userAchievement) => (
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
                    title="No achievements yet"
                    description="Complete lessons and build a streak to start earning badges."
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
          </section>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <Card>
              <CardHeader>
                <CardTitle>Learning identity</CardTitle>
                <CardDescription>Progress signals connected to real activity.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Current streak</p>
                  <p className="mt-1 text-2xl font-bold text-slate-950">
                    {streakLoading ? <Skeleton className="h-8 w-20" /> : `${streak?.currentStreakDays ?? 0} days`}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Achievements unlocked</p>
                  <p className="mt-1 text-2xl font-bold text-slate-950">
                    {achievementsLoading ? <Skeleton className="h-8 w-16" /> : unlockedAchievements.length}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Achievement points</p>
                  <p className="mt-1 text-2xl font-bold text-slate-950">
                    {achievementsLoading ? <Skeleton className="h-8 w-16" /> : totalPoints}
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
