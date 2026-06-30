import { useQuery } from '@apollo/client/react';
import * as Tabs from '@radix-ui/react-tabs';
import {
  AlertCircle,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  PlayCircle,
  Star,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState as UIEmptyState,
  PageHeader,
  Progress,
  StatusBadge,
} from '@/components/ui';
import { SkeletonEnrollmentCard } from '@/components/skeletons';
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

function getNextLessonPath(enrollment: Enrollment): string {
  const progressRecords = enrollment.progressRecords ?? [];
  const nextProgress = progressRecords.find((progress) => !progress.completed) ?? progressRecords[0];

  if (!nextProgress?.lesson?.id) {
    return `/courses/${enrollment.course.slug}`;
  }

  return `/courses/${enrollment.course.slug}/learn/${nextProgress.lesson.id}`;
}

function EnrollmentCard({ enrollment }: Readonly<EnrollmentCardProps>) {
  const { course, progressPercentage, completedLessons, totalLessons, status, lastAccessedAt } =
    enrollment;
  const isCompleted = status === 'COMPLETED';

  return (
    <Link
      to={getNextLessonPath(enrollment)}
      className="group block min-w-[20rem] rounded-3xl border border-white/10 bg-white/6 p-4 shadow-2xl shadow-black/10 backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-300/35 sm:min-w-[26rem]"
    >
      <div className="flex gap-4">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="h-24 w-32 flex-shrink-0 rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-24 w-32 flex-shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-300/20 to-violet-500/25">
            <BookOpen className="h-8 w-8 text-cyan-200" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-semibold text-slate-50 group-hover:text-cyan-200">
              {course.title}
            </h3>
            {isCompleted && (
              <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2 py-0.5 text-xs font-medium text-emerald-200">
                <CheckCircle2 className="h-3 w-3" />
                Completed
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-slate-400">{course.creator.fullName}</p>

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">
                {completedLessons} of {totalLessons} lessons
              </span>
              <span className="font-medium text-cyan-200">{progressPercentage}%</span>
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
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-50">{value}</p>
          </div>
          <div className={`rounded-2xl p-3 ${bgColor} bg-opacity-10`}>
            <Icon className={`h-6 w-6 ${color.replace('600', '200')}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EnrollmentEmptyState({ status }: { status: 'all' | 'in_progress' | 'completed' }) {
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
    <UIEmptyState
      icon={<GraduationCap className="h-6 w-6" />}
      title={message.title}
      description={message.description}
      action={
        <Button asChild>
          <Link to="/courses">
            <BookOpen className="h-4 w-4" />
            {message.cta}
          </Link>
        </Button>
      }
    />
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
      <div>
        <main className="app-container py-8">
          <div className="mb-8 space-y-2">
            <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-60 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-lg border border-slate-200 bg-white p-6">
                <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                <div className="mt-2 h-8 w-16 animate-pulse rounded bg-slate-200" />
              </div>
            ))}
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonEnrollmentCard key={index} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container py-16">
        <UIEmptyState
          icon={<AlertCircle className="h-6 w-6" />}
          title="Failed to load My Learning"
          description={error.message}
          action={
            <Button asChild>
              <Link to="/courses">Browse Courses</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="cinematic-page">
      <main className="app-container min-h-[calc(100vh-4.5rem)] py-10">
        <PageHeader
          eyebrow="Learner workspace"
          title="My Learning"
          description={`Welcome back, ${user?.fullName || user?.username || 'learner'}. Continue active courses, review completed paths, and track your progress.`}
          actions={
            <Button asChild>
              <Link to="/courses">
                <BookOpen className="h-4 w-4" />
                Browse Courses
              </Link>
            </Button>
          }
        />

        <section className="cinematic-section mb-8 overflow-hidden rounded-3xl">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
            <div>
              <StatusBadge tone="emerald">Netflix-style learning shelf</StatusBadge>
              <h2 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-slate-50">
                {inProgressEnrollments[0]?.course.title ?? 'Build your next skill streak'}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
                {inProgressEnrollments[0]
                  ? `${inProgressEnrollments[0].completedLessons} of ${inProgressEnrollments[0].totalLessons} lessons complete. Jump back into the next mission.`
                  : 'Enroll in a course to unlock your featured banner, progress shelves, completed courses, and achievement timeline.'}
              </p>
              <Button className="mt-7" variant="premium" asChild>
                <Link to={inProgressEnrollments[0] ? getNextLessonPath(inProgressEnrollments[0]) : '/courses'}>
                  <PlayCircle className="h-4 w-4" />
                  {inProgressEnrollments[0] ? 'Resume course' : 'Find a course'}
                </Link>
              </Button>
            </div>
            <div className="rounded-3xl bg-linear-to-br from-cyan-300/18 via-sky-500/12 to-violet-500/22 p-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-cyan-200">Learning timeline</p>
              <div className="mt-6 space-y-4">
                {['Continue lesson', 'Join discussion', 'Unlock milestone'].map((item, index) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 text-sm font-bold text-cyan-100">
                      {index + 1}
                    </div>
                    <p className="font-semibold text-slate-100">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatsCard key={stat.label} {...stat} />
          ))}
        </div>

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
              <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
                {inProgressEnrollments.slice(0, 3).map((enrollment) => (
                  <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Courses</CardTitle>
            <CardDescription>
              {enrollments.length} course{enrollments.length !== 1 ? 's' : ''} total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs.Root defaultValue="all">
              <Tabs.List className="mb-6 flex flex-wrap gap-2 border-b border-white/8 pb-3">
                <Tabs.Trigger
                  value="all"
                  className="rounded-full border border-transparent px-4 py-2 text-sm font-medium text-slate-400 transition hover:text-slate-50 data-[state=active]:border-cyan-300/30 data-[state=active]:bg-cyan-300/10 data-[state=active]:text-cyan-100"
                >
                  All ({enrollments.length})
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="in_progress"
                  className="rounded-full border border-transparent px-4 py-2 text-sm font-medium text-slate-400 transition hover:text-slate-50 data-[state=active]:border-cyan-300/30 data-[state=active]:bg-cyan-300/10 data-[state=active]:text-cyan-100"
                >
                  In Progress ({inProgressEnrollments.length})
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="completed"
                  className="rounded-full border border-transparent px-4 py-2 text-sm font-medium text-slate-400 transition hover:text-slate-50 data-[state=active]:border-cyan-300/30 data-[state=active]:bg-cyan-300/10 data-[state=active]:text-cyan-100"
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
                  <EnrollmentEmptyState status="all" />
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
                  <EnrollmentEmptyState status="in_progress" />
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
                  <EnrollmentEmptyState status="completed" />
                )}
              </Tabs.Content>
            </Tabs.Root>
          </CardContent>
        </Card>

        {totalLessonsCompleted > 0 && (
          <Card className="mt-8 bg-linear-to-r from-cyan-300/10 to-violet-500/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-violet-200">{totalLessonsCompleted}</p>
                  <p className="text-sm text-slate-400">Lessons Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-cyan-200">{completedEnrollments.length}</p>
                  <p className="text-sm text-slate-400">Courses Finished</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-emerald-200">
                    {formatTimeSpent(totalTimeSpent)}
                  </p>
                  <p className="text-sm text-slate-400">Total Learning Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
