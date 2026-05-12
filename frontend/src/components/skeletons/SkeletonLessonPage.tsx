import { Skeleton } from '@/components/ui';

export function SkeletonLessonPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-5 w-36" />

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>

              <Skeleton className="mt-5 aspect-video w-full rounded-xl" />

              <div className="mt-6 space-y-3">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-5/6" />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Skeleton className="h-10 w-32 rounded-lg" />
                <Skeleton className="h-10 w-32 rounded-lg" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <Skeleton className="h-6 w-28" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="mt-3 h-4 w-full" />
                    <Skeleton className="mt-2 h-4 w-5/6" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-4 h-2 w-full" />
              <Skeleton className="mt-3 h-10 w-full rounded-lg" />
              <Skeleton className="mt-4 h-4 w-48" />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <Skeleton className="h-5 w-24" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
