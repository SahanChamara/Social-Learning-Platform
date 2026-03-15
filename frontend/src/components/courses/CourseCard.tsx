import { Link } from 'react-router-dom';
import { Clock3, Star, Users } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { Course } from '@/types/courses';

interface CourseCardProps {
  course: Course;
  className?: string;
  href?: string;
}

function formatDuration(totalMinutes: number): string {
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

function formatPrice(priceInCents: number): string {
  if (priceInCents <= 0) {
    return 'Free';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(priceInCents / 100);
}

function formatEnrollmentCount(enrollmentCount: number): string {
  if (enrollmentCount >= 1_000_000) {
    return `${(enrollmentCount / 1_000_000).toFixed(1)}M`;
  }

  if (enrollmentCount >= 1_000) {
    return `${(enrollmentCount / 1_000).toFixed(1)}k`;
  }

  return `${enrollmentCount}`;
}

function initialsFromName(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function CourseCardContent({ course, className }: { course: Course; className?: string }) {
  const creatorInitials = initialsFromName(course.creator.fullName);

  return (
    <Card
      className={cn(
        'group h-full overflow-hidden border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
        className,
      )}
    >
      <div className="relative aspect-video overflow-hidden bg-linear-to-br from-sky-100 via-cyan-50 to-blue-100">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={`${course.title} thumbnail`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-blue-700/60">
            {course.category.name.slice(0, 1).toUpperCase()}
          </div>
        )}

        {course.isFeatured && (
          <span className="absolute left-3 top-3 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
            Featured
          </span>
        )}
      </div>

      <CardHeader className="space-y-2 p-4 pb-0">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            {course.category.name}
          </span>
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {course.difficulty}
          </span>
        </div>

        <CardTitle className="line-clamp-2 text-lg leading-tight text-slate-900">
          {course.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 p-4">
        <p className="line-clamp-2 text-sm text-slate-600">{course.description ?? 'No description yet.'}</p>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {course.averageRating.toFixed(1)} ({course.ratingCount})
          </span>

          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" />
            {formatDuration(course.durationMinutes)}
          </span>

          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {formatEnrollmentCount(course.enrollmentCount)}
          </span>
        </div>
      </CardContent>

      <CardFooter className="mt-auto flex items-center justify-between border-t border-slate-100 p-4 pt-3">
        <div className="inline-flex items-center gap-2">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
            {creatorInitials}
          </div>
          <p className="text-sm text-slate-700">{course.creator.fullName}</p>
        </div>

        <p className="text-base font-semibold text-blue-700">{formatPrice(course.priceInCents)}</p>
      </CardFooter>
    </Card>
  );
}

export function CourseCard({ course, className, href }: CourseCardProps) {
  if (!href) {
    return <CourseCardContent course={course} className={className} />;
  }

  return (
    <Link to={href} className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-lg">
      <CourseCardContent course={course} className={className} />
    </Link>
  );
}
