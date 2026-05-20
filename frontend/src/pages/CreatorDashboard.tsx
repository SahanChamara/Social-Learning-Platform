import { useMutation, useQuery } from '@apollo/client/react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  Eye,
  FileText,
  GraduationCap,
  Plus,
  Star,
  UploadCloud,
} from 'lucide-react';
import { Button, EmptyState, PageHeader, Skeleton } from '@/components/ui';
import { COURSES_BY_CREATOR_QUERY, PUBLISH_COURSE_MUTATION, UNPUBLISH_COURSE_MUTATION } from '@/graphql';
import { useAuth, useToast } from '@/hooks';
import type {
  Course,
  CourseIdMutationVariables,
  CourseMutationResponse,
  CoursesByCreatorResponse,
  CoursesByCreatorQueryVariables,
} from '@/types/courses';

function formatNumber(value: number) {
  return new Intl.NumberFormat('en').format(value);
}

function formatDate(value?: string | null) {
  if (!value) {
    return 'Not published';
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

function courseStatus(course: Course) {
  if (course.isPublished) {
    return {
      label: 'Published',
      className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    };
  }

  return {
    label: 'Draft',
    className: 'bg-amber-50 text-amber-700 ring-amber-200',
  };
}

export default function CreatorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data, loading, error, refetch } = useQuery<
    CoursesByCreatorResponse,
    CoursesByCreatorQueryVariables
  >(COURSES_BY_CREATOR_QUERY, {
    skip: !user,
    variables: {
      creatorId: user?.id ?? '',
      publishedOnly: false,
    },
    fetchPolicy: 'cache-and-network',
  });

  const [publishCourse, { loading: publishing }] = useMutation<
    CourseMutationResponse,
    CourseIdMutationVariables
  >(PUBLISH_COURSE_MUTATION);
  const [unpublishCourse, { loading: unpublishing }] = useMutation<
    CourseMutationResponse,
    CourseIdMutationVariables
  >(UNPUBLISH_COURSE_MUTATION);

  const courses = data?.coursesByCreator ?? [];
  const publishedCourses = courses.filter((course) => course.isPublished);
  const draftCourses = courses.filter((course) => !course.isPublished);
  const totalEnrollments = courses.reduce((sum, course) => sum + course.enrollmentCount, 0);
  const ratedCourses = courses.filter((course) => course.ratingCount > 0);
  const averageRating =
    ratedCourses.length > 0
      ? ratedCourses.reduce((sum, course) => sum + course.averageRating, 0) / ratedCourses.length
      : 0;

  const lifecycleLoading = publishing || unpublishing;

  const handleLifecycle = async (course: Course) => {
    try {
      if (course.isPublished) {
        await unpublishCourse({ variables: { id: course.id } });
      } else {
        await publishCourse({ variables: { id: course.id } });
      }

      await refetch();
      toast({
        title: course.isPublished ? 'Course unpublished' : 'Course published',
        description: `${course.title} was updated successfully.`,
      });
    } catch (mutationError) {
      toast({
        title: course.isPublished ? 'Unable to unpublish course' : 'Unable to publish course',
        description:
          mutationError instanceof Error
            ? mutationError.message
            : 'Please check the course curriculum and try again.',
        variant: 'destructive',
      });
    }
  };

  const stats = [
    { label: 'My courses', value: courses.length, icon: BookOpen },
    { label: 'Published', value: publishedCourses.length, icon: UploadCloud },
    { label: 'Drafts', value: draftCourses.length, icon: FileText },
    { label: 'Enrollments', value: totalEnrollments, icon: GraduationCap },
  ];

  return (
    <div className="bg-slate-50">
      <div className="app-container py-10">
        <PageHeader
          eyebrow="Creator workspace"
          title="Creator dashboard"
          description="Manage course drafts, publication status, enrollments, and learner rating signals."
          actions={
            <Button asChild>
              <Link to="/courses/create">
                <Plus className="h-4 w-4" />
                Create Course
              </Link>
            </Button>
          }
        />

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-3 text-2xl font-bold text-slate-950">
                  {loading ? <Skeleton className="h-8 w-14" /> : formatNumber(stat.value)}
                </p>
              </div>
            );
          })}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-slate-950">My courses</h2>
            </div>

            {loading ? (
              <div className="space-y-3 p-5">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-28 w-full rounded-lg" />
                ))}
              </div>
            ) : error ? (
              <div className="p-5">
                <EmptyState
                  title="Courses could not be loaded"
                  description={error.message}
                  icon={<BookOpen className="h-6 w-6" />}
                />
              </div>
            ) : courses.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  title="No courses yet"
                  description="Create the first course draft and add a starter curriculum before publishing."
                  icon={<Plus className="h-6 w-6" />}
                  action={
                    <Button asChild>
                      <Link to="/courses/create">Create Course</Link>
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {courses.map((course) => {
                  const status = courseStatus(course);
                  return (
                    <article key={course.id} className="grid gap-4 p-5 md:grid-cols-[8rem_minmax(0,1fr)_auto]">
                      <div className="overflow-hidden rounded-lg bg-slate-100">
                        {course.thumbnailUrl ? (
                          <img
                            src={course.thumbnailUrl}
                            alt=""
                            className="h-28 w-full object-cover md:h-full"
                          />
                        ) : (
                          <div className="flex h-28 items-center justify-center text-slate-400 md:h-full">
                            <BookOpen className="h-7 w-7" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${status.className}`}
                          >
                            {status.label}
                          </span>
                          <span className="text-xs font-medium uppercase text-slate-500">
                            {course.difficulty}
                          </span>
                        </div>
                        <h3 className="mt-2 text-base font-semibold text-slate-950">{course.title}</h3>
                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
                          {course.description}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                          <span>{formatNumber(course.enrollmentCount)} enrollments</span>
                          <span>{course.ratingCount > 0 ? `${course.averageRating.toFixed(1)} rating` : 'No ratings'}</span>
                          <span>{formatDate(course.publishedAt)}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-stretch">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/courses/${course.slug}`}>
                            <Eye className="h-4 w-4" />
                            View
                          </Link>
                        </Button>
                        <Button
                          variant={course.isPublished ? 'outline' : 'default'}
                          size="sm"
                          disabled={lifecycleLoading}
                          onClick={() => void handleLifecycle(course)}
                        >
                          {course.isPublished ? 'Unpublish' : 'Publish'}
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-700" />
                <h2 className="text-base font-semibold text-slate-950">Performance</h2>
              </div>
              <dl className="mt-5 space-y-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-600">Average rating</dt>
                  <dd className="inline-flex items-center gap-1 font-semibold text-slate-950">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {averageRating.toFixed(1)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-600">Rated courses</dt>
                  <dd className="font-semibold text-slate-950">{ratedCourses.length}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-600">Total enrollments</dt>
                  <dd className="font-semibold text-slate-950">{formatNumber(totalEnrollments)}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
