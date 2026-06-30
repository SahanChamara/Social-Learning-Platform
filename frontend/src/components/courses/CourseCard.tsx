import { Link } from 'react-router-dom';
import { Clock3, Star, Users } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, StatusBadge } from '@/components/ui';
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
        'group h-full overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan-300/40 hover:shadow-cyan-500/10',
        className,
      )}
    >
      <div className="relative aspect-video overflow-hidden bg-linear-to-br from-cyan-300/20 via-blue-500/15 to-violet-500/20">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={`${course.title} thumbnail`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-cyan-200/80">
            {course.category.name.slice(0, 1).toUpperCase()}
          </div>
        )}

        {course.isFeatured && (
          <StatusBadge tone="gold" className="absolute left-3 top-3">Featured</StatusBadge>
        )}
      </div>

      <CardHeader className="space-y-2 p-4 pb-0">
        <div className="flex items-center justify-between gap-2">
          <StatusBadge tone="cyan">{course.category.name}</StatusBadge>
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{course.difficulty}</span>
        </div>

        <CardTitle className="line-clamp-2 text-lg leading-tight text-slate-50">
          {course.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 p-4">
        <p className="line-clamp-2 text-sm text-slate-400">{course.description ?? 'No description yet.'}</p>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
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

      <CardFooter className="mt-auto flex items-center justify-between border-t border-white/8 p-4 pt-3">
        <div className="inline-flex items-center gap-2">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-cyan-300 to-violet-500 text-xs font-semibold text-white">
            {creatorInitials}
          </div>
          <p className="text-sm text-slate-300">{course.creator.fullName}</p>
        </div>

        <p className="text-base font-semibold text-cyan-200">{formatPrice(course.priceInCents)}</p>
      </CardFooter>
    </Card>
  );
}

export function CourseCard({ course, className, href }: CourseCardProps) {
  if (!href) {
    return <CourseCardContent course={course} className={className} />;
  }

  return (
    <Link to={href} className="block h-full rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
      <CourseCardContent course={course} className={className} />
    </Link>
  );
}
