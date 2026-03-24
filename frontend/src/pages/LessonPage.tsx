import { useMutation, useQuery } from '@apollo/client/react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Download,
  ExternalLink,
  FileText,
  HelpCircle,
  Layers,
  Loader2,
  PlayCircle,
  Square,
  Video,
} from 'lucide-react';
import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Progress } from '@/components/ui';
import {
  COURSE_ENROLLMENT_QUERY,
  COURSE_QUERY,
  MARK_LESSON_COMPLETE_MUTATION,
} from '@/graphql';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/useToast';
import type {
  CourseEnrollmentQueryVariables,
  CourseEnrollmentResponse,
  CourseQueryVariables,
  CourseResponse,
  Lesson,
  LessonProgress,
  LessonType,
  MarkLessonCompleteMutationResponse,
  MarkLessonCompleteMutationVariables,
  Module,
} from '@/types/courses';

function formatDuration(totalMinutes: number): string {
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

function getLessonTypeIcon(type: LessonType) {
  switch (type) {
    case 'VIDEO':
      return Video;
    case 'TEXT':
      return FileText;
    case 'QUIZ':
      return HelpCircle;
    case 'ASSIGNMENT':
      return BookOpen;
    case 'RESOURCE':
      return ExternalLink;
    default:
      return FileText;
  }
}

interface LessonNavigationInfo {
  prevLesson: { moduleIndex: number; lessonIndex: number; lesson: Lesson } | null;
  nextLesson: { moduleIndex: number; lessonIndex: number; lesson: Lesson } | null;
  currentModuleIndex: number;
  currentLessonIndex: number;
  totalLessons: number;
  currentLessonNumber: number;
}

function getLessonNavigation(
  modules: Module[],
  lessonId: string
): LessonNavigationInfo | null {
  let totalLessons = 0;
  let currentLessonNumber = 0;
  let foundCurrent = false;
  let prevLesson: LessonNavigationInfo['prevLesson'] = null;
  let nextLesson: LessonNavigationInfo['nextLesson'] = null;
  let currentModuleIndex = 0;
  let currentLessonIndex = 0;

  for (let mi = 0; mi < modules.length; mi++) {
    const module = modules[mi];
    for (let li = 0; li < module.lessons.length; li++) {
      const lesson = module.lessons[li];
      totalLessons++;

      if (lesson.id === lessonId) {
        foundCurrent = true;
        currentLessonNumber = totalLessons;
        currentModuleIndex = mi;
        currentLessonIndex = li;
      } else if (!foundCurrent) {
        prevLesson = { moduleIndex: mi, lessonIndex: li, lesson };
      } else if (foundCurrent && !nextLesson) {
        nextLesson = { moduleIndex: mi, lessonIndex: li, lesson };
      }
    }
  }

  if (!foundCurrent) return null;

  return {
    prevLesson,
    nextLesson,
    currentModuleIndex,
    currentLessonIndex,
    totalLessons,
    currentLessonNumber,
  };
}

interface VideoContentProps {
  lesson: Lesson;
}

function VideoContent({ lesson }: Readonly<VideoContentProps>) {
  if (!lesson.videoUrl) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-lg bg-slate-100">
        <div className="text-center">
          <Video className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-2 text-sm text-slate-600">Video not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video overflow-hidden rounded-lg bg-black">
      <video
        src={lesson.videoUrl}
        controls
        className="h-full w-full"
        poster={lesson.videoThumbnailUrl}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

interface TextContentProps {
  lesson: Lesson;
}

function TextContent({ lesson }: Readonly<TextContentProps>) {
  if (!lesson.textContent) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
        <FileText className="mx-auto h-12 w-12 text-slate-400" />
        <p className="mt-2 text-sm text-slate-600">No content available</p>
      </div>
    );
  }

  return (
    <div className="prose prose-slate max-w-none rounded-lg border border-slate-200 bg-white p-6">
      <div dangerouslySetInnerHTML={{ __html: lesson.textContent }} />
    </div>
  );
}

interface QuizContentProps {
  lesson: Lesson;
}

function QuizContent({ lesson }: Readonly<QuizContentProps>) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
      <HelpCircle className="mx-auto h-12 w-12 text-blue-500" />
      <h3 className="mt-4 text-lg font-semibold text-slate-900">Quiz: {lesson.title}</h3>
      <p className="mt-2 text-sm text-slate-600">
        {lesson.description || 'Complete this quiz to test your knowledge.'}
      </p>
      <p className="mt-4 text-xs text-slate-400">Quiz functionality coming soon</p>
    </div>
  );
}

interface AssignmentContentProps {
  lesson: Lesson;
}

function AssignmentContent({ lesson }: Readonly<AssignmentContentProps>) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-orange-100 p-3">
          <BookOpen className="h-6 w-6 text-orange-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900">Assignment: {lesson.title}</h3>
          {lesson.assignmentMaxPoints && (
            <p className="mt-1 text-sm text-slate-600">
              Maximum Points: {lesson.assignmentMaxPoints}
            </p>
          )}
        </div>
      </div>
      {lesson.assignmentInstructions ? (
        <div className="mt-4 rounded-lg bg-slate-50 p-4">
          <h4 className="text-sm font-medium text-slate-700">Instructions</h4>
          <div
            className="prose prose-sm prose-slate mt-2"
            dangerouslySetInnerHTML={{ __html: lesson.assignmentInstructions }}
          />
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-600">No instructions provided.</p>
      )}
      <p className="mt-4 text-xs text-slate-400">Assignment submission coming soon</p>
    </div>
  );
}

interface ResourceContentProps {
  lesson: Lesson;
}

function ResourceContent({ lesson }: Readonly<ResourceContentProps>) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-green-100 p-3">
          <ExternalLink className="h-6 w-6 text-green-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900">{lesson.title}</h3>
          {lesson.description && (
            <p className="mt-1 text-sm text-slate-600">{lesson.description}</p>
          )}
        </div>
      </div>
      {lesson.resourceUrl && (
        <div className="mt-4">
          <a
            href={lesson.resourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
          >
            <ExternalLink className="h-4 w-4" />
            Open Resource
          </a>
          {lesson.isDownloadable && (
            <a
              href={lesson.resourceUrl}
              download
              className="ml-2 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              Download
            </a>
          )}
        </div>
      )}
    </div>
  );
}

interface LessonContentProps {
  lesson: Lesson;
}

function LessonContent({ lesson }: Readonly<LessonContentProps>) {
  switch (lesson.type) {
    case 'VIDEO':
      return <VideoContent lesson={lesson} />;
    case 'TEXT':
      return <TextContent lesson={lesson} />;
    case 'QUIZ':
      return <QuizContent lesson={lesson} />;
    case 'ASSIGNMENT':
      return <AssignmentContent lesson={lesson} />;
    case 'RESOURCE':
      return <ResourceContent lesson={lesson} />;
    default:
      return <TextContent lesson={lesson} />;
  }
}

export default function LessonPage() {
  const { slug, lessonId } = useParams<{ slug: string; lessonId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const {
    data: courseData,
    loading: courseLoading,
    error: courseError,
  } = useQuery<CourseResponse, CourseQueryVariables>(COURSE_QUERY, {
    variables: { slug: slug! },
    skip: !slug,
  });

  const {
    data: enrollmentData,
    loading: enrollmentLoading,
    refetch: refetchEnrollment,
  } = useQuery<CourseEnrollmentResponse, CourseEnrollmentQueryVariables>(COURSE_ENROLLMENT_QUERY, {
    variables: { courseId: courseData?.course?.id ?? '' },
    skip: !isAuthenticated || !courseData?.course?.id,
    fetchPolicy: 'cache-and-network',
  });

  const [markComplete, { loading: markingComplete }] = useMutation<
    MarkLessonCompleteMutationResponse,
    MarkLessonCompleteMutationVariables
  >(MARK_LESSON_COMPLETE_MUTATION, {
    onCompleted: () => {
      toast({
        title: 'Lesson completed!',
        description: 'Your progress has been saved.',
        variant: 'success',
      });
      void refetchEnrollment();
    },
    onError: (error) => {
      toast({
        title: 'Failed to mark complete',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  const course = courseData?.course;
  const enrollment = enrollmentData?.courseEnrollment;
  const modules = course?.modules ?? [];

  const lessonNavigation = useMemo(() => {
    if (!lessonId || modules.length === 0) return null;
    return getLessonNavigation(modules, lessonId);
  }, [modules, lessonId]);

  const currentLesson = useMemo(() => {
    if (!lessonNavigation) return null;
    const module = modules[lessonNavigation.currentModuleIndex];
    return module?.lessons[lessonNavigation.currentLessonIndex] ?? null;
  }, [modules, lessonNavigation]);

  const currentModule = useMemo(() => {
    if (!lessonNavigation) return null;
    return modules[lessonNavigation.currentModuleIndex] ?? null;
  }, [modules, lessonNavigation]);

  const isLessonCompleted = useMemo(() => {
    if (!enrollment || !lessonId) return false;
    return enrollment.progressRecords.some(
      (p: LessonProgress) => p.lesson.id === lessonId && p.completed
    );
  }, [enrollment, lessonId]);

  const handleMarkComplete = () => {
    if (!lessonId || isLessonCompleted) return;
    void markComplete({ variables: { lessonId } });
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!lessonNavigation || !slug) return;
    const target = direction === 'prev' ? lessonNavigation.prevLesson : lessonNavigation.nextLesson;
    if (target) {
      navigate(`/courses/${slug}/learn/${target.lesson.id}`);
    }
  };

  const isLoading = courseLoading || (isAuthenticated && enrollmentLoading);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-4 text-sm text-slate-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-4 text-xl font-semibold text-slate-900">Course not found</h2>
        <p className="mt-2 text-slate-600">
          {courseError?.message || "The course you're looking for doesn't exist."}
        </p>
        <Link
          to="/courses"
          className="mt-6 inline-flex items-center gap-2 text-blue-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </Link>
      </div>
    );
  }

  if (!currentLesson || !lessonNavigation) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-yellow-500" />
        <h2 className="mt-4 text-xl font-semibold text-slate-900">Lesson not found</h2>
        <p className="mt-2 text-slate-600">This lesson doesn't exist in the course.</p>
        <Link
          to={`/courses/${slug}`}
          className="mt-6 inline-flex items-center gap-2 text-blue-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to course
        </Link>
      </div>
    );
  }

  if (!isAuthenticated || !enrollment) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-yellow-500" />
        <h2 className="mt-4 text-xl font-semibold text-slate-900">Enrollment required</h2>
        <p className="mt-2 text-slate-600">You need to enroll in this course to access lessons.</p>
        <Link
          to={`/courses/${slug}`}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          View course details
        </Link>
      </div>
    );
  }

  const LessonIcon = getLessonTypeIcon(currentLesson.type);
  const progressPercentage = enrollment.progressPercentage;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link
            to={`/courses/${slug}`}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{course.title}</span>
            <span className="sm:hidden">Back</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 sm:flex">
              <Progress value={progressPercentage} className="w-32" />
              <span className="text-sm font-medium text-slate-700">{progressPercentage}%</span>
            </div>
            <span className="text-sm text-slate-500">
              {lessonNavigation.currentLessonNumber} / {lessonNavigation.totalLessons}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Lesson Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Layers className="h-4 w-4" />
            <span>
              Module {lessonNavigation.currentModuleIndex + 1}: {currentModule?.title}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">{currentLesson.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1">
              <LessonIcon className="h-4 w-4" />
              {currentLesson.type.charAt(0) + currentLesson.type.slice(1).toLowerCase()}
            </span>
            {currentLesson.durationMinutes && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDuration(currentLesson.durationMinutes)}
              </span>
            )}
            {currentLesson.isFree && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                Free Preview
              </span>
            )}
          </div>
        </div>

        {/* Lesson Description */}
        {currentLesson.description && (
          <p className="mb-6 text-slate-600">{currentLesson.description}</p>
        )}

        {/* Lesson Content */}
        <div className="mb-8">
          <LessonContent lesson={currentLesson} />
        </div>

        {/* Transcript (for video lessons) */}
        {currentLesson.type === 'VIDEO' && currentLesson.transcript && (
          <details className="mb-8 rounded-lg border border-slate-200 bg-white">
            <summary className="cursor-pointer px-4 py-3 font-medium text-slate-900 hover:bg-slate-50">
              View Transcript
            </summary>
            <div className="border-t border-slate-200 p-4">
              <div
                className="prose prose-sm prose-slate"
                dangerouslySetInnerHTML={{ __html: currentLesson.transcript }}
              />
            </div>
          </details>
        )}

        {/* Additional Resources */}
        {currentLesson.additionalResources && (
          <div className="mb-8 rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="font-medium text-slate-900">Additional Resources</h3>
            <div
              className="prose prose-sm prose-slate mt-2"
              dangerouslySetInnerHTML={{ __html: currentLesson.additionalResources }}
            />
          </div>
        )}

        {/* Mark as Complete */}
        <div className="mb-8 rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => !isLessonCompleted && handleMarkComplete()}
                disabled={isLessonCompleted || markingComplete}
                className={`flex h-6 w-6 items-center justify-center rounded border-2 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  isLessonCompleted
                    ? 'border-green-600 bg-green-600'
                    : 'border-slate-300 bg-white hover:border-blue-400'
                }`}
                aria-label={isLessonCompleted ? 'Lesson completed' : 'Mark lesson as complete'}
              >
                {isLessonCompleted ? (
                  <Check className="h-4 w-4 text-white" />
                ) : (
                  <Square className="h-3 w-3 text-transparent" />
                )}
              </button>
              <div>
                <p className="font-medium text-slate-900">
                  {isLessonCompleted ? 'Lesson Completed!' : 'Mark as Complete'}
                </p>
                <p className="text-sm text-slate-500">
                  {isLessonCompleted
                    ? 'Great job! Move on to the next lesson.'
                    : 'Check this box when you finish the lesson.'}
                </p>
              </div>
            </div>
            {isLessonCompleted && <CheckCircle2 className="h-6 w-6 text-green-600" />}
            {markingComplete && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-6">
          <div>
            {lessonNavigation.prevLesson ? (
              <button
                type="button"
                onClick={() => handleNavigate('prev')}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>
            ) : (
              <div />
            )}
          </div>

          <div>
            {lessonNavigation.nextLesson ? (
              <button
                type="button"
                onClick={() => handleNavigate('next')}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                <span className="hidden sm:inline">Next Lesson</span>
                <span className="sm:hidden">Next</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <Link
                to={`/courses/${slug}`}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span className="hidden sm:inline">Complete Course</span>
                <span className="sm:hidden">Done</span>
              </Link>
            )}
          </div>
        </div>

        {/* Lesson List Sidebar (collapsible on mobile) */}
        <details className="mt-8 rounded-lg border border-slate-200 bg-white">
          <summary className="cursor-pointer px-4 py-3 font-medium text-slate-900 hover:bg-slate-50">
            <span className="inline-flex items-center gap-2">
              <PlayCircle className="h-4 w-4" />
              Course Content ({lessonNavigation.totalLessons} lessons)
            </span>
          </summary>
          <div className="border-t border-slate-200">
            {modules.map((module, mi) => (
              <div key={module.id} className="border-b border-slate-100 last:border-b-0">
                <div className="bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                  Module {mi + 1}: {module.title}
                </div>
                <ul>
                {module.lessons.map((lesson) => {
                    const isActive = lesson.id === lessonId;
                    const isComplete = enrollment.progressRecords.some(
                      (p: LessonProgress) => p.lesson.id === lesson.id && p.completed
                    );
                    const LIcon = getLessonTypeIcon(lesson.type);

                    return (
                      <li key={lesson.id}>
                        <Link
                          to={`/courses/${slug}/learn/${lesson.id}`}
                          className={`flex items-center gap-3 px-4 py-2 text-sm transition hover:bg-slate-50 ${
                            isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                          }`}
                        >
                          <div
                            className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
                              isComplete
                                ? 'bg-green-100 text-green-600'
                                : isActive
                                  ? 'bg-blue-100 text-blue-600'
                                  : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {isComplete ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <LIcon className="h-3 w-3" />
                            )}
                          </div>
                          <span className="flex-1 truncate">{lesson.title}</span>
                          {lesson.durationMinutes && (
                            <span className="text-xs text-slate-400">
                              {lesson.durationMinutes}m
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
