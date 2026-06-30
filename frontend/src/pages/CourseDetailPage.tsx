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
import { EnrollButton } from '@/components/courses';
import { CommentForm, CommentList, CourseReviewList, RatingStars } from '@/components/engagement';
import { SkeletonCourseDetail } from '@/components/skeletons';
import { AnimatedPage, StatusBadge } from '@/components/ui';
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
      <AnimatedPage>
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
          <h1 className="mb-2 text-2xl font-semibold text-slate-50">Invalid course URL</h1>
          <p className="mb-6 text-slate-400">This page needs a valid course slug.</p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Courses
          </Link>
        </div>
      </AnimatedPage>
    );
  }

  if (loading && !data) {
    return <SkeletonCourseDetail />;
  }

  if (error && !data) {
    return (
      <AnimatedPage>
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="mb-2 text-2xl font-semibold text-slate-50">Unable to load this course</h1>
          <p className="mb-6 text-slate-400">There was a problem fetching course details. Please try again.</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                void refetch({ slug });
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Retry
            </button>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950/45 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-900"
            >
              Back to Courses
            </Link>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  const course = data?.course;

  if (!course) {
    return (
      <AnimatedPage>
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
          <h1 className="mb-2 text-2xl font-semibold text-slate-50">Course not found</h1>
          <p className="mb-6 text-slate-400">The requested course does not exist or may have been removed.</p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Courses
          </Link>
        </div>
      </AnimatedPage>
    );
  }

  const modules = sortModules(course.modules);
  const firstLesson = modules
    .flatMap((module) => sortLessons(module.lessons))
    .find((lesson) => lesson.isPublished);

  return (
    <AnimatedPage>
      <div className="app-container min-h-[calc(100vh-4.5rem)] py-10">
        <Link
          to="/courses"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-cyan-200"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Courses
        </Link>

        <section className="cinematic-section overflow-hidden rounded-3xl">
          <div className="grid min-h-[68vh] lg:grid-cols-[minmax(0,2.1fr)_minmax(24rem,0.9fr)]">
            <div className="p-6 sm:p-8 2xl:p-10">
              <div className="mb-6 aspect-video max-h-[54vh] overflow-hidden rounded-3xl bg-linear-to-br from-cyan-300/20 via-blue-500/15 to-violet-500/20">
                {course.thumbnailUrl ? (
                  <img
                    src={course.thumbnailUrl}
                    alt={`${course.title} cover`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl font-bold text-cyan-200/80">
                    {course.category.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="mb-4 flex flex-wrap items-center gap-2">
                <StatusBadge tone="cyan">{course.category.name}</StatusBadge>
                <StatusBadge tone="violet">{course.difficulty}</StatusBadge>
                <StatusBadge tone="slate">{course.language}</StatusBadge>
              </div>

              <h1 className="max-w-6xl text-4xl font-black tracking-tight text-slate-50 sm:text-5xl 2xl:text-6xl">{course.title}</h1>
              <p className="mt-4 max-w-5xl text-base leading-relaxed text-slate-400 sm:text-lg">
                {course.description ?? 'No course description is available yet.'}
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg border border-slate-800 bg-slate-950/45 p-3">
                  <p className="text-xs text-slate-500">Rating</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-slate-100">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {course.averageRating.toFixed(1)} ({course.ratingCount})
                  </p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950/45 p-3">
                  <p className="text-xs text-slate-500">Duration</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-slate-100">
                    <Clock3 className="h-4 w-4" />
                    {formatDuration(course.durationMinutes)}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950/45 p-3">
                  <p className="text-xs text-slate-500">Lessons</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-slate-100">
                    <Layers className="h-4 w-4" />
                    {modules.reduce((count, module) => count + module.lessons.length, 0)} total
                  </p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950/45 p-3">
                  <p className="text-xs text-slate-500">Enrolled</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-slate-100">
                    <Users className="h-4 w-4" />
                    {course.enrollmentCount}
                  </p>
                </div>
              </div>
            </div>

            <aside className="border-t border-slate-800 p-6 sm:p-8 lg:border-l lg:border-t-0 2xl:p-10">
              <p className="text-3xl font-bold text-slate-50">{formatPrice(course.priceInCents)}</p>
              <p className="mt-2 text-sm text-slate-400">
                Created by <span className="font-medium text-slate-100">{course.creator.fullName}</span>
              </p>

              <EnrollButton
                courseId={course.id}
                courseTitle={course.title}
                courseSlug={course.slug}
                priceInCents={course.priceInCents}
                firstLessonId={firstLesson?.id}
              />

              <div className="mt-6 space-y-3 border-t border-slate-800 pt-4 text-sm text-slate-300">
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
          <Tabs.List className="flex flex-wrap gap-2 rounded-xl border border-slate-800 bg-slate-950/55 p-2 shadow-2xl shadow-black/15 backdrop-blur">
            <Tabs.Trigger
              value="overview"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-400 transition data-[state=active]:bg-cyan-400 data-[state=active]:text-slate-950"
            >
              Overview
            </Tabs.Trigger>
            <Tabs.Trigger
              value="curriculum"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-400 transition data-[state=active]:bg-cyan-400 data-[state=active]:text-slate-950"
            >
              Curriculum
            </Tabs.Trigger>
            <Tabs.Trigger
              value="engagement"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-400 transition data-[state=active]:bg-cyan-400 data-[state=active]:text-slate-950"
            >
              Reviews & Discussion
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="overview" className="cinematic-section mt-5 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-slate-50">What you will learn</h2>
            {course.learningOutcomes ? (
              <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-400">{course.learningOutcomes}</p>
            ) : (
              <p className="mt-3 text-slate-400">Learning outcomes will be added soon.</p>
            )}

            <h3 className="mt-8 text-lg font-semibold text-slate-50">Requirements</h3>
            {course.requirements ? (
              <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-400">{course.requirements}</p>
            ) : (
              <p className="mt-3 text-slate-400">No special requirements are needed for this course.</p>
            )}

            <h3 className="mt-8 text-lg font-semibold text-slate-50">Tags</h3>
            {course.tags.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {course.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-300"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-slate-400">No tags yet.</p>
            )}
          </Tabs.Content>

          <Tabs.Content value="curriculum" className="cinematic-section mt-5 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-slate-50">Course curriculum</h2>
            <p className="mt-2 text-sm text-slate-400">
              {modules.length} module{modules.length === 1 ? '' : 's'} •{' '}
              {modules.reduce((count, module) => count + module.lessons.length, 0)} lesson
              {modules.reduce((count, module) => count + module.lessons.length, 0) === 1 ? '' : 's'}
            </p>

            {modules.length > 0 ? (
              <div className="mt-6 space-y-4">
                {modules.map((module) => {
                  const lessons = sortLessons(module.lessons);

                  return (
                    <article key={module.id} className="rounded-xl border border-slate-800 bg-slate-950/45 p-4 sm:p-5">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
                          Module {module.orderIndex + 1}
                        </p>
                        <p className="text-xs text-slate-500">
                          {lessons.length} lesson{lessons.length === 1 ? '' : 's'} •{' '}
                          {formatDuration(module.durationMinutes)}
                        </p>
                      </div>

                      <h3 className="text-lg font-semibold text-slate-50">{module.title}</h3>
                      {module.description && <p className="mt-1 text-sm text-slate-400">{module.description}</p>}

                      {lessons.length > 0 ? (
                        <ul className="mt-4 space-y-2">
                          {lessons.map((lesson) => (
                            <li
                              key={lesson.id}
                              className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-100">{lesson.title}</p>
                                <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-400">
                                  <LessonTypeIcon type={lesson.type} />
                                  {formatLessonType(lesson.type)}
                                </p>
                              </div>
                              <p className="shrink-0 text-xs font-medium text-slate-400">
                                {lesson.durationMinutes ? formatDuration(lesson.durationMinutes) : 'TBD'}
                              </p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-3 text-sm text-slate-400">Lessons for this module will be added soon.</p>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="mt-4 text-slate-400">No modules published yet.</p>
            )}
          </Tabs.Content>

          <Tabs.Content value="engagement" className="mt-5 grid gap-6 2xl:grid-cols-2">
            <section className="cinematic-section rounded-2xl p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-50">Learner reviews</h2>
                  <p className="mt-2 max-w-2xl text-slate-400">
                    Ratings and written reviews help learners judge fit before enrolling.
                  </p>
                </div>
                <div className="rounded-lg border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-sm font-semibold text-amber-200">
                  {course.averageRating.toFixed(1)} average
                </div>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
                <CourseReviewList
                  courseId={course.id}
                  averageRating={course.averageRating}
                  ratingCount={course.ratingCount}
                />
                <RatingStars
                  courseId={course.id}
                  averageRating={course.averageRating}
                  ratingCount={course.ratingCount}
                />
              </div>
            </section>

            <section className="cinematic-section rounded-2xl p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-50">Course discussion</h2>
                  <p className="mt-2 max-w-2xl text-slate-400">
                    Ask questions about the curriculum, reply to other learners, and surface helpful answers.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <CommentForm
                  targetType="COURSE"
                  targetId={course.id}
                  placeholder="Ask a question or share a helpful course note..."
                />
              </div>

              <div className="mt-6">
                <CommentList
                  targetType="COURSE"
                  targetId={course.id}
                  emptyMessage="No discussion yet. Ask the first question about this course."
                />
              </div>
            </section>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </AnimatedPage>
  );
}
