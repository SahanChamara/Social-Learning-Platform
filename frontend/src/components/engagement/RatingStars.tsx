import { useMutation, useQuery } from '@apollo/client/react';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { Star } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MY_RATING_QUERY, RATE_COURSE_MUTATION } from '@/graphql';
import { SkeletonRatingStars } from '@/components/skeletons';
import { useAuth } from '@/hooks';
import { useToast } from '@/hooks/useToast';

interface Rating {
  id: string;
  ratingValue: number;
  reviewContent?: string | null;
}

interface MyRatingResponse {
  myRating: Rating | null;
}

interface MyRatingVariables {
  courseId: string;
}

interface RateCourseMutationResponse {
  rateCourse: {
    id: string;
    ratingValue: number;
    reviewContent?: string | null;
    course: {
      id: string;
      averageRating: number;
      ratingCount: number;
    };
  };
}

interface RateCourseMutationVariables {
  input: {
    courseId: string;
    ratingValue: number;
    reviewContent?: string;
  };
}

interface RatingStarsProps {
  courseId: string;
  averageRating: number;
  ratingCount: number;
  className?: string;
}

function formatAverage(value: number): string {
  if (!Number.isFinite(value)) {
    return '0.0';
  }
  return value.toFixed(1);
}

export function RatingStars({
  courseId,
  averageRating,
  ratingCount,
  className,
}: Readonly<RatingStarsProps>) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [selectedRatingDraft, setSelectedRatingDraft] = useState<number | null>(null);
  const [reviewDraft, setReviewDraft] = useState<string | null>(null);
  const [ratingStatsOverride, setRatingStatsOverride] = useState<{ average: number; count: number } | null>(null);

  const { data: myRatingData, loading: ratingLoading } = useQuery<MyRatingResponse, MyRatingVariables>(
    MY_RATING_QUERY,
    {
      variables: { courseId },
      skip: !isAuthenticated,
      fetchPolicy: 'cache-and-network',
    },
  );

  if (authLoading || (isAuthenticated && ratingLoading && !myRatingData)) {
    return (
      <section className={className}>
        <SkeletonRatingStars />
      </section>
    );
  }

  const myRating = myRatingData?.myRating;
  const selectedRating = selectedRatingDraft ?? myRating?.ratingValue ?? 0;
  const reviewText = reviewDraft ?? myRating?.reviewContent ?? '';
  const displayAverage = ratingStatsOverride?.average ?? averageRating;
  const displayCount = ratingStatsOverride?.count ?? ratingCount;

  const [rateCourse, { loading }] = useMutation<RateCourseMutationResponse, RateCourseMutationVariables>(
    RATE_COURSE_MUTATION,
  );

  const submitRating = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to rate this course.',
      });
      return;
    }

    if (selectedRating < 1 || selectedRating > 5) {
      toast({
        title: 'Select a rating',
        description: 'Please choose between 1 and 5 stars.',
      });
      return;
    }

    if (loading) {
      return;
    }

    const previousMyRating = myRatingData?.myRating?.ratingValue ?? 0;
    const hasPreviousRating = previousMyRating > 0;

    const optimisticCount = hasPreviousRating ? displayCount : displayCount + 1;
    const optimisticAverage =
      optimisticCount === 0
        ? selectedRating
        : hasPreviousRating
          ? (displayAverage * displayCount - previousMyRating + selectedRating) / optimisticCount
          : (displayAverage * displayCount + selectedRating) / optimisticCount;

    setRatingStatsOverride({ average: optimisticAverage, count: optimisticCount });

    try {
      const { data } = await rateCourse({
        variables: {
          input: {
            courseId,
            ratingValue: selectedRating,
            reviewContent: reviewText.trim() ? reviewText.trim() : undefined,
          },
        },
      });

      if (data?.rateCourse?.course) {
        setRatingStatsOverride({
          average: data.rateCourse.course.averageRating,
          count: data.rateCourse.course.ratingCount,
        });
      }

      toast({
        title: 'Rating saved',
        description: 'Your rating was submitted successfully.',
      });
    } catch {
      setRatingStatsOverride(null);
      toast({
        title: 'Unable to submit rating',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <section className={className}>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-sm text-slate-600">Course rating</p>
        <p className="mt-1 inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
          {formatAverage(displayAverage)} <span className="text-sm font-normal text-slate-600">({displayCount})</span>
        </p>
      </div>

      {!isAuthenticated ? (
        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          <Link to="/auth/login" className="font-semibold text-blue-700 hover:text-blue-800">
            Sign in
          </Link>{' '}
          to rate this course and leave a review.
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900">Your rating</h3>
          <RadioGroup.Root
            className="mt-3 flex items-center gap-2"
            value={selectedRating > 0 ? String(selectedRating) : ''}
            onValueChange={(value) => setSelectedRatingDraft(Number(value))}
            aria-label="Course rating"
          >
            {[1, 2, 3, 4, 5].map((value) => {
              const active = selectedRating >= value;
              return (
                <RadioGroup.Item
                  key={value}
                  value={String(value)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-400 transition hover:border-amber-400 hover:text-amber-500 data-[state=checked]:border-amber-400 data-[state=checked]:text-amber-500"
                  aria-label={`${value} star${value === 1 ? '' : 's'}`}
                >
                  <Star className={`h-5 w-5 ${active ? 'fill-current' : ''}`} />
                </RadioGroup.Item>
              );
            })}
          </RadioGroup.Root>

          <label htmlFor={`review-${courseId}`} className="mt-4 block text-sm font-medium text-slate-700">
            Review
          </label>
          <textarea
            id={`review-${courseId}`}
            value={reviewText}
            onChange={(event) => setReviewDraft(event.target.value)}
            placeholder="Share what you liked and what could be improved..."
            rows={4}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs outline-hidden transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => {
                void submitRating();
              }}
              disabled={loading}
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Submit rating'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
