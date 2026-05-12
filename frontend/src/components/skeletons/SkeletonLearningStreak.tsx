import { Skeleton } from '@/components/ui';

export function SkeletonLearningStreak() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-lg bg-slate-50 p-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-2 h-8 w-12" />
            <Skeleton className="mt-1 h-3 w-10" />
          </div>
        ))}
      </div>

      <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-36" />
      </div>
    </div>
  );
}
