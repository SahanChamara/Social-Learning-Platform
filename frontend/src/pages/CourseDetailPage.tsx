import { useQuery } from '@apollo/client/react';
import * as Tabs from '@radix-ui/react-tabs';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  HelpCircle,
  Languages,
  Layers,
  Link as LinkIcon,
  PlayCircle,
  Star,
  Users,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { COURSE_QUERY } from '@/graphql';
import type {
  CourseQueryVariables,
  CourseResponse,
  Lesson,
  LessonType,
  Module,
} from '@/types/courses';

function formatDuration(totalMinutes: number): string {
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

function formatPrice(priceInCents: number): string {
  if (priceInCents <= 0) {
    return 'Free';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(priceInCents / 100);
}

function formatLessonType(type: LessonType): string {
  switch (type) {
    case 'VIDEO':
      return 'Video';
    case 'TEXT':
      return 'Article';
    case 'QUIZ':
      return 'Quiz';
    case 'ASSIGNMENT':
      return 'Assignment';
    case 'RESOURCE':
      return 'Resource';
    default:
      return type;
  }
}

function LessonTypeIcon({ type }: Readonly<{ type: LessonType }>) {
  switch (type) {
    case 'VIDEO':
      return <PlayCircle className="h-4 w-4 text-blue-600" />;
    case 'TEXT':
      return <FileText className="h-4 w-4 text-emerald-600" />;
    case 'QUIZ':
      return <HelpCircle className="h-4 w-4 text-amber-600" />;
    case 'ASSIGNMENT':
      return <CheckCircle2 className="h-4 w-4 text-violet-600" />;
    case 'RESOURCE':
      return <LinkIcon className="h-4 w-4 text-cyan-600" />;
    default:
      return <BookOpen className="h-4 w-4 text-slate-600" />;
  }
}

function sortModules(modules: Module[]): Module[] {
  return [...modules].sort((a, b) => a.orderIndex - b.orderIndex);
}

function sortLessons(lessons: Lesson[]): Lesson[] {
  return [...lessons].sort((a, b) => a.orderIndex - b.orderIndex);
}

function CourseDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 h-6 w-40 animate-pulse rounded bg-slate-200" />
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[2fr_1fr]">
            <div className="space-y-4 p-6">
              <div className="aspect-video animate-pulse rounded-xl bg-slate-200" />
              <div className="h-10 w-4/5 animate-pulse rounded bg-slate-200" />
              <div className="h-5 w-full animate-pulse rounded bg-slate-200" />
              <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
            </div>
            <div className="border-t border-slate-200 p-6 lg:border-l lg:border-t-0">
              <div className="h-9 w-28 animate-pulse rounded bg-slate-200" />
              <div className="mt-4 h-11 w-full animate-pulse rounded bg-slate-200" />
              <div className="mt-4 h-4 w-5/6 animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data, loading, error, refetch } = useQuery<CourseResponse, CourseQueryVariables>(
    COURSE_QUERY,
    {
      variables: {
        slug: slug ?? '',
      },
      skip: !slug,
      notifyOnNetworkStatusChange: true,
    },
  );

  if (!slug) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
          <h1 className="mb-2 text-2xl font-semibold text-slate-900">Invalid course URL</h1>
          <p className="mb-6 text-slate-600">This page needs a valid course slug.</p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  if (loading && !data) {
    return <CourseDetailLoading />;
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="mb-2 text-2xl font-semibold text-slate-900">Unable to load this course</h1>
          <p className="mb-6 text-slate-600">There was a problem fetching course details. Please try again.</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                void refetch({ slug });
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Retry
            </button>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Back to Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const course = data?.course;

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
          <h1 className="mb-2 text-2xl font-semibold text-slate-900">Course not found</h1>
          <p className="mb-6 text-slate-600">The requested course does not exist or may have been removed.</p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const modules = sortModules(course.modules);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          to="/courses"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Courses
        </Link>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[2fr_1fr]">
            <div className="p-6 sm:p-8">
              <div className="mb-6 aspect-video overflow-hidden rounded-xl bg-linear-to-br from-sky-100 via-cyan-50 to-blue-100">
                {course.thumbnailUrl ? (
                  <img
                    src={course.thumbnailUrl}
                    alt={`${course.title} cover`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl font-bold text-blue-700/60">
                    {course.category.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  {course.category.name}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {course.difficulty}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {course.language}
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{course.title}</h1>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                {course.description ?? 'No course description is available yet.'}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Rating</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-slate-900">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {course.averageRating.toFixed(1)} ({course.ratingCount})
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Duration</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-slate-900">
                    <Clock3 className="h-4 w-4" />
                    {formatDuration(course.durationMinutes)}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Lessons</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-slate-900">
                    <Layers className="h-4 w-4" />
                    {modules.reduce((count, module) => count + module.lessons.length, 0)} total
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Enrolled</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-slate-900">
                    <Users className="h-4 w-4" />
                    {course.enrollmentCount}
                  </p>
                </div>
              </div>
            </div>

            <aside className="border-t border-slate-200 p-6 sm:p-8 lg:border-l lg:border-t-0">
              <p className="text-3xl font-bold text-slate-900">{formatPrice(course.priceInCents)}</p>
              <p className="mt-2 text-sm text-slate-600">
                Created by <span className="font-medium text-slate-900">{course.creator.fullName}</span>
              </p>

              <button
                type="button"
                disabled
                className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white opacity-60"
                aria-disabled="true"
              >
                Enroll (Coming in Phase 3)
              </button>
              <p className="mt-2 text-xs text-slate-500">Enrollment flow will be added in Task 3.6.</p>

              <div className="mt-6 space-y-3 border-t border-slate-200 pt-4 text-sm text-slate-700">
                <p className="inline-flex items-center gap-2">
                  <Languages className="h-4 w-4 text-slate-500" /> {course.language}
                </p>
                <p className="inline-flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-slate-500" /> {course.difficulty} level
                </p>
                <p className="inline-flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-slate-500" /> {modules.length} module
                  {modules.length === 1 ? '' : 's'}
                </p>
              </div>
            </aside>
          </div>
        </section>

        <Tabs.Root defaultValue="overview" className="mt-8">
          <Tabs.List className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
            <Tabs.Trigger
              value="overview"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Overview
            </Tabs.Trigger>
            <Tabs.Trigger
              value="curriculum"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Curriculum
            </Tabs.Trigger>
            <Tabs.Trigger
              value="reviews"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Reviews
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="overview" className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-slate-900">What you will learn</h2>
            {course.learningOutcomes ? (
              <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-600">{course.learningOutcomes}</p>
            ) : (
              <p className="mt-3 text-slate-600">Learning outcomes will be added soon.</p>
            )}

            <h3 className="mt-8 text-lg font-semibold text-slate-900">Requirements</h3>
            {course.requirements ? (
              <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-600">{course.requirements}</p>
            ) : (
              <p className="mt-3 text-slate-600">No special requirements are needed for this course.</p>
            )}

            <h3 className="mt-8 text-lg font-semibold text-slate-900">Tags</h3>
            {course.tags.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {course.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-slate-600">No tags yet.</p>
            )}
          </Tabs.Content>

          <Tabs.Content value="curriculum" className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-slate-900">Course curriculum</h2>
            <p className="mt-2 text-sm text-slate-600">
              {modules.length} module{modules.length === 1 ? '' : 's'} •{' '}
              {modules.reduce((count, module) => count + module.lessons.length, 0)} lesson
              {modules.reduce((count, module) => count + module.lessons.length, 0) === 1 ? '' : 's'}
            </p>

            {modules.length > 0 ? (
              <div className="mt-6 space-y-4">
                {modules.map((module) => {
                  const lessons = sortLessons(module.lessons);

                  return (
                    <article key={module.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Module {module.orderIndex + 1}
                        </p>
                        <p className="text-xs text-slate-500">
                          {lessons.length} lesson{lessons.length === 1 ? '' : 's'} •{' '}
                          {formatDuration(module.durationMinutes)}
                        </p>
                      </div>

                      <h3 className="text-lg font-semibold text-slate-900">{module.title}</h3>
                      {module.description && <p className="mt-1 text-sm text-slate-600">{module.description}</p>}

                      {lessons.length > 0 ? (
                        <ul className="mt-4 space-y-2">
                          {lessons.map((lesson) => (
                            <li
                              key={lesson.id}
                              className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-900">{lesson.title}</p>
                                <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-600">
                                  <LessonTypeIcon type={lesson.type} />
                                  {formatLessonType(lesson.type)}
                                </p>
                              </div>
                              <p className="shrink-0 text-xs font-medium text-slate-600">
                                {lesson.durationMinutes ? formatDuration(lesson.durationMinutes) : 'TBD'}
                              </p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-3 text-sm text-slate-600">Lessons for this module will be added soon.</p>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="mt-4 text-slate-600">No modules published yet.</p>
            )}
          </Tabs.Content>

          <Tabs.Content value="reviews" className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-slate-900">Reviews</h2>
            <p className="mt-2 text-slate-600">
              Ratings and reviews UI will be implemented in Phase 4 engagement tasks.
            </p>
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
              <p className="text-sm text-slate-600">
                Current course rating: <span className="font-semibold text-slate-900">{course.averageRating.toFixed(1)}</span>{' '}
                from <span className="font-semibold text-slate-900">{course.ratingCount}</span> ratings.
              </p>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}
