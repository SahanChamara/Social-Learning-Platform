import { Skeleton } from '@/components/ui';

export function SkeletonAuthDemo() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-3">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-5 w-[420px] max-w-full" />
        </div>

        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="space-y-4 p-6">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-80" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-lg bg-gray-50 p-4">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="mt-2 h-6 w-24" />
                </div>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-72 rounded-2xl" />
              <Skeleton className="h-72 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
