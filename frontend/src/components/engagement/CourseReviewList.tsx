import { useQuery } from '@apollo/client/react';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, Star } from 'lucide-react';
import { COURSE_RATING_STATS_QUERY, COURSE_REVIEWS_QUERY } from '@/graphql';
import { Skeleton } from '@/components/ui';

interface ReviewUser {
  id: string;
  username: string;
  fullName: string;
}

interface CourseReview {
  id: string;
  ratingValue: number;
  reviewTitle?: string | null;
  reviewContent?: string | null;
  helpfulCount: number;
  isVerifiedPurchase: boolean;
  user: ReviewUser;
  createdAt: string;
}

interface CourseReviewsResponse {
  courseReviews: {
    content: CourseReview[];
    totalElements: number;
  };
}

interface CourseReviewsVariables {
  courseId: string;
  page?: number;
  size?: number;
}

interface RatingStatsResponse {
  courseRatingStats: {
    average: number;
    totalCount: number;
    fiveStarCount: number;
    fourStarCount: number;
    threeStarCount: number;
    twoStarCount: number;
    oneStarCount: number;
  };
}

interface CourseReviewListProps {
  courseId: string;
  averageRating: number;
  ratingCount: number;
  pageSize?: number;
}

function formatTime(dateValue: string): string {
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return 'recently';
  }
  return formatDistanceToNow(parsed, { addSuffix: true });
}

function initialsFromName(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function RatingRow({
  label,
  count,
  total,
}: Readonly<{ label: string; count: number; total: number }>) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="grid grid-cols-[3rem_minmax(0,1fr)_3rem] items-center gap-2 text-xs text-slate-600">
      <span>{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-amber-400" style={{ width: `${percentage}%` }} />
      </div>
      <span className="text-right">{count}</span>
    </div>
  );
}

function Stars({ value }: Readonly<{ value: number }>) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
        />
      ))}
    </span>
  );
}

export function CourseReviewList({
  courseId,
  averageRating,
  ratingCount,
  pageSize = 6,
}: Readonly<CourseReviewListProps>) {
  const { data: reviewsData, loading: reviewsLoading, error: reviewsError } = useQuery<
    CourseReviewsResponse,
    CourseReviewsVariables
  >(COURSE_REVIEWS_QUERY, {
    variables: {
      courseId,
      page: 0,
      size: pageSize,
    },
    fetchPolicy: 'cache-and-network',
  });

  const { data: statsData, loading: statsLoading } = useQuery<RatingStatsResponse, CourseReviewsVariables>(
    COURSE_RATING_STATS_QUERY,
    {
      variables: {
        courseId,
      },
      fetchPolicy: 'cache-and-network',
    },
  );

  const reviews = reviewsData?.courseReviews.content ?? [];
  const stats = statsData?.courseRatingStats;
  const displayAverage = stats?.average ?? averageRating;
  const displayTotal = stats?.totalCount ?? ratingCount;

  return (
    <section className="space-y-5">
      <div className="grid gap-4 md:grid-cols-[16rem_minmax(0,1fr)]">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-600">Learner rating</p>
          <div className="mt-2 flex items-end gap-2">
            <p className="text-4xl font-bold text-slate-950">{displayAverage.toFixed(1)}</p>
            <p className="pb-1 text-sm text-slate-600">
              {displayTotal} rating{displayTotal === 1 ? '' : 's'}
            </p>
          </div>
          <div className="mt-3">
            <Stars value={Math.round(displayAverage)} />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-950">Rating breakdown</p>
          {statsLoading && !stats ? (
            <div className="mt-4 space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-4 w-full" />
              ))}
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              <RatingRow label="5 star" count={stats?.fiveStarCount ?? 0} total={displayTotal} />
              <RatingRow label="4 star" count={stats?.fourStarCount ?? 0} total={displayTotal} />
              <RatingRow label="3 star" count={stats?.threeStarCount ?? 0} total={displayTotal} />
              <RatingRow label="2 star" count={stats?.twoStarCount ?? 0} total={displayTotal} />
              <RatingRow label="1 star" count={stats?.oneStarCount ?? 0} total={displayTotal} />
            </div>
          )}
        </div>
      </div>

      {reviewsLoading && !reviewsData ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      ) : reviewsError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Unable to load written reviews right now.
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <Star className="mx-auto h-5 w-5 text-slate-400" />
          <p className="mt-2 text-sm text-slate-600">
            No written reviews yet. Reviews from enrolled learners will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <header className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    {initialsFromName(review.user.fullName) || review.user.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-950">{review.user.fullName}</p>
                    <p className="text-xs text-slate-500">@{review.user.username} · {formatTime(review.createdAt)}</p>
                  </div>
                </div>
                <Stars value={review.ratingValue} />
              </header>

              {review.reviewTitle ? (
                <h3 className="mt-4 text-sm font-semibold text-slate-950">{review.reviewTitle}</h3>
              ) : null}
              {review.reviewContent ? (
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{review.reviewContent}</p>
              ) : null}

              {review.isVerifiedPurchase ? (
                <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verified learner
                </p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
