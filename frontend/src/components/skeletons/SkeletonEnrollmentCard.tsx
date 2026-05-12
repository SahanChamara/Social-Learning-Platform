import { Skeleton } from '@/components/ui';

export function SkeletonEnrollmentCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex gap-4">
        <Skeleton className="h-24 w-32 flex-shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="mt-1 h-4 w-32" />
          <div className="mt-3 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}
