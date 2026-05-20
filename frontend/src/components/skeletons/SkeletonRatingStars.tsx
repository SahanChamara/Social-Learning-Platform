import { Skeleton } from '@/components/ui';

export function SkeletonRatingStars() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="mt-2 h-4 w-24" />
      <div className="mt-4 flex gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-10 rounded-lg" />
        ))}
      </div>
      <Skeleton className="mt-4 h-24 w-full" />
      <Skeleton className="mt-4 h-10 w-24" />
    </div>
  );
}
