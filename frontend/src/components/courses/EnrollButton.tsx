import { useMutation, useQuery } from '@apollo/client/react';
import { BookOpen, CheckCircle2, Loader2, LogIn, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ENROLLMENT_STATUS_QUERY, ENROLL_COURSE_MUTATION } from '@/graphql';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/useToast';
import type {
  EnrollCourseMutationResponse,
  EnrollCourseMutationVariables,
  EnrollmentStatusQueryVariables,
  EnrollmentStatusResponse,
} from '@/types/courses';

interface EnrollButtonProps {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  priceInCents: number;
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

export function EnrollButton({
  courseId,
  courseTitle,
  courseSlug,
  priceInCents,
}: Readonly<EnrollButtonProps>) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const {
    data: enrollmentData,
    loading: statusLoading,
    refetch: refetchStatus,
  } = useQuery<EnrollmentStatusResponse, EnrollmentStatusQueryVariables>(
    ENROLLMENT_STATUS_QUERY,
    {
      variables: { courseId },
      skip: !isAuthenticated,
      fetchPolicy: 'cache-and-network',
    }
  );

  const [enrollCourse, { loading: enrolling }] = useMutation<
    EnrollCourseMutationResponse,
    EnrollCourseMutationVariables
  >(ENROLL_COURSE_MUTATION, {
    onCompleted: () => {
      toast({
        title: 'Successfully enrolled!',
        description: `You are now enrolled in "${courseTitle}". Start learning now!`,
        variant: 'success',
      });
      void refetchStatus();
    },
    onError: (error) => {
      const message = error.message.includes('already enrolled')
        ? 'You are already enrolled in this course.'
        : error.message || 'Failed to enroll. Please try again.';

      toast({
        title: 'Enrollment failed',
        description: message,
        variant: 'destructive',
      });
    },
  });

  const handleEnroll = () => {
    void enrollCourse({ variables: { courseId } });
  };

  const isLoading = authLoading || statusLoading;
  const enrollmentStatus = enrollmentData?.enrollmentStatus;
  const isEnrolled = !!enrollmentStatus;
  const isCompleted = enrollmentStatus?.status === 'COMPLETED';
  const progressPercentage = enrollmentStatus?.progressPercentage ?? 0;

  if (isLoading) {
    return (
      <button
        type="button"
        disabled
        className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-slate-200 px-4 text-sm font-semibold text-slate-500"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </button>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mt-5 space-y-3">
        <Link
          to="/login"
          state={{ from: `/courses/${courseSlug}` }}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <LogIn className="h-4 w-4" />
          Login to Enroll {priceInCents > 0 && `- ${formatPrice(priceInCents)}`}
        </Link>
        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    );
  }

  if (isEnrolled) {
    return (
      <div className="mt-5 space-y-3">
        {isCompleted ? (
          <>
            <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="font-medium">Course Completed!</span>
            </div>
            <Link
              to={`/courses/${courseSlug}/learn`}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <BookOpen className="h-4 w-4" />
              Review Course
            </Link>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">Your Progress</span>
                <span className="font-semibold text-blue-600">{progressPercentage}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">
                {enrollmentStatus?.completedLessons ?? 0} of {enrollmentStatus?.totalLessons ?? 0}{' '}
                lessons completed
              </p>
            </div>
            <Link
              to={`/courses/${courseSlug}/learn`}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <PlayCircle className="h-4 w-4" />
              Continue Learning
            </Link>
          </>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleEnroll}
      disabled={enrolling}
      className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {enrolling ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Enrolling...
        </>
      ) : (
        <>
          <BookOpen className="h-4 w-4" />
          {priceInCents > 0 ? `Enroll Now - ${formatPrice(priceInCents)}` : 'Enroll for Free'}
        </>
      )}
    </button>
  );
}
