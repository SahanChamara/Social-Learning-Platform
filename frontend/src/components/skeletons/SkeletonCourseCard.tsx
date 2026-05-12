import { Skeleton } from '@/components/ui';

export function SkeletonCourseCard() {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <Skeleton className="aspect-video" />
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}
