import { Skeleton } from '@/components/ui';

export function SkeletonCommentList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="min-w-0">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-1 h-3 w-32" />
              </div>
            </div>
          </div>
          <Skeleton className="mt-3 h-16 w-full" />
          <div className="mt-3 flex gap-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
