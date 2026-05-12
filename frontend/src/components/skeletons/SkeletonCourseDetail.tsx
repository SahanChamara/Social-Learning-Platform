import { Skeleton } from '@/components/ui';

export function SkeletonCourseDetail() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-6 w-40" />
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[2fr_1fr]">
            <div className="space-y-4 p-6">
              <Skeleton className="aspect-video rounded-xl" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-10 w-4/5" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-20 rounded-lg" />
                ))}
              </div>
            </div>
            <div className="border-t border-slate-200 p-6 lg:border-l lg:border-t-0">
              <Skeleton className="h-9 w-28" />
              <Skeleton className="mt-4 h-11 w-full" />
              <Skeleton className="mt-4 h-4 w-5/6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
