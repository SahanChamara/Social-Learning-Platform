import { useQuery } from '@apollo/client/react';
import * as Tabs from '@radix-ui/react-tabs';
import {
  AlertCircle,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  Loader2,
  PlayCircle,
  Star,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Progress } from '@/components/ui';
import { MY_ENROLLMENTS_QUERY } from '@/graphql';
import { useAuth } from '@/hooks/useAuth';
import type { Enrollment, MyEnrollmentsResponse } from '@/types/courses';

function formatDuration(totalMinutes: number): string {
  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTimeSpent(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

interface EnrollmentCardProps {
  enrollment: Enrollment;
}

function EnrollmentCard({ enrollment }: Readonly<EnrollmentCardProps>) {
  const { course, progressPercentage, completedLessons, totalLessons, status, lastAccessedAt } =
    enrollment;
  const isCompleted = status === 'COMPLETED';

  return (
    <Link
      to={`/courses/${course.slug}/learn`}
      className="group block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"
    >
      <div className="flex gap-4">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="h-24 w-32 flex-shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-24 w-32 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-purple-100">
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-semibold text-slate-900 group-hover:text-blue-600">
              {course.title}
            </h3>
            {isCompleted && (
              <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                <CheckCircle2 className="h-3 w-3" />
                Completed
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-slate-600">{course.creator.fullName}</p>

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">
                {completedLessons} of {totalLessons} lessons
              </span>
              <span className="font-medium text-blue-600">{progressPercentage}%</span>
            </div>
            <Progress
              value={progressPercentage}
              indicatorClassName={isCompleted ? 'bg-green-600' : undefined}
            />
          </div>

          <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(course.durationMinutes)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-yellow-500" />
              {course.averageRating.toFixed(1)}
            </span>
            {lastAccessedAt && (
              <span className="text-slate-400">Last accessed {formatDate(lastAccessedAt)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

function StatsCard({ label, value, icon: Icon, color, bgColor }: Readonly<StatsCardProps>) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          </div>
          <div className={`rounded-lg p-3 ${bgColor}`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ status }: { status: 'all' | 'in_progress' | 'completed' }) {
  const messages = {
    all: {
      title: "You haven't enrolled in any courses yet",
      description: 'Start your learning journey by exploring our course catalog.',
      cta: 'Browse Courses',
    },
    in_progress: {
      title: 'No courses in progress',
      description: 'All your enrolled courses have been completed. Great job!',
      cta: 'Find New Courses',
    },
    completed: {
      title: 'No completed courses yet',
      description: 'Keep learning! Your completed courses will appear here.',
      cta: 'Continue Learning',
    },
  };

  const message = messages[status];

  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
      <GraduationCap className="mx-auto h-12 w-12 text-slate-400" />
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{message.title}</h3>
      <p className="mt-2 text-sm text-slate-600">{message.description}</p>
      <Link
        to="/courses"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        <BookOpen className="h-4 w-4" />
        {message.cta}
      </Link>
    </div>
  );
}

export default function LearnerDashboard() {
  const { user } = useAuth();

  const { data, loading, error } = useQuery<MyEnrollmentsResponse>(MY_ENROLLMENTS_QUERY, {
    fetchPolicy: 'cache-and-network',
  });

  const enrollments = data?.myEnrollments ?? [];
  const inProgressEnrollments = enrollments.filter((e) => e.status === 'ENROLLED');
  const completedEnrollments = enrollments.filter((e) => e.status === 'COMPLETED');

  const totalTimeSpent = enrollments.reduce((sum, e) => sum + e.timeSpentMinutes, 0);
  const totalLessonsCompleted = enrollments.reduce((sum, e) => sum + e.completedLessons, 0);

  const stats: StatsCardProps[] = [
    {
      label: 'Enrolled Courses',
      value: enrollments.length,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'In Progress',
      value: inProgressEnrollments.length,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      label: 'Completed',
      value: completedEnrollments.length,
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Total Time Spent',
      value: formatTimeSpent(totalTimeSpent),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  if (loading && !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-4 text-sm text-slate-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-4 text-xl font-semibold text-slate-900">Failed to load dashboard</h2>
        <p className="mt-2 text-slate-600">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">My Learning</h1>
              <p className="mt-1 text-slate-600">
                Welcome back, {user?.fullName || user?.username}!
              </p>
            </div>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <BookOpen className="h-4 w-4" />
              Browse Courses
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatsCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Continue Learning Section */}
        {inProgressEnrollments.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-blue-600" />
                Continue Learning
              </CardTitle>
              <CardDescription>Pick up where you left off</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inProgressEnrollments.slice(0, 3).map((enrollment) => (
                  <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Enrollments with Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>All Courses</CardTitle>
            <CardDescription>
              {enrollments.length} course{enrollments.length !== 1 ? 's' : ''} total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs.Root defaultValue="all">
              <Tabs.List className="mb-6 flex gap-2 border-b border-slate-200">
                <Tabs.Trigger
                  value="all"
                  className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                >
                  All ({enrollments.length})
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="in_progress"
                  className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                >
                  In Progress ({inProgressEnrollments.length})
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="completed"
                  className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                >
                  Completed ({completedEnrollments.length})
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="all">
                {enrollments.length > 0 ? (
                  <div className="space-y-4">
                    {enrollments.map((enrollment) => (
                      <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
                    ))}
                  </div>
                ) : (
                  <EmptyState status="all" />
                )}
              </Tabs.Content>

              <Tabs.Content value="in_progress">
                {inProgressEnrollments.length > 0 ? (
                  <div className="space-y-4">
                    {inProgressEnrollments.map((enrollment) => (
                      <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
                    ))}
                  </div>
                ) : (
                  <EmptyState status="in_progress" />
                )}
              </Tabs.Content>

              <Tabs.Content value="completed">
                {completedEnrollments.length > 0 ? (
                  <div className="space-y-4">
                    {completedEnrollments.map((enrollment) => (
                      <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
                    ))}
                  </div>
                ) : (
                  <EmptyState status="completed" />
                )}
              </Tabs.Content>
            </Tabs.Root>
          </CardContent>
        </Card>

        {/* Achievements Preview */}
        {totalLessonsCompleted > 0 && (
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">{totalLessonsCompleted}</p>
                  <p className="text-sm text-slate-600">Lessons Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{completedEnrollments.length}</p>
                  <p className="text-sm text-slate-600">Courses Finished</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {formatTimeSpent(totalTimeSpent)}
                  </p>
                  <p className="text-sm text-slate-600">Total Learning Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
