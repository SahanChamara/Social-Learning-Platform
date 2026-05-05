import * as Popover from '@radix-ui/react-popover';
import { addDays, format, parseISO, startOfDay, startOfWeek, subDays } from 'date-fns';
import { Calendar, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LearningStreakData {
  currentStreakDays: number;
  longestStreakDays: number;
  totalActiveDays: number;
  lastActivityDate?: string | null;
  streakStartDate?: string | null;
}

interface LearningStreakProps {
  streak?: LearningStreakData | null;
  loading?: boolean;
  className?: string;
}

function getActivityRange(streak?: LearningStreakData | null) {
  if (!streak?.lastActivityDate || streak.currentStreakDays <= 0) {
    return null;
  }

  const lastActivity = startOfDay(parseISO(streak.lastActivityDate));
  const startFromData = streak.streakStartDate ? startOfDay(parseISO(streak.streakStartDate)) : null;
  const computedStart = startOfDay(subDays(lastActivity, Math.max(0, streak.currentStreakDays - 1)));

  return {
    start: startFromData ?? computedStart,
    end: lastActivity,
  };
}

function buildCalendarDays() {
  const today = startOfDay(new Date());
  const startDate = startOfWeek(subDays(today, 21), { weekStartsOn: 1 });
  return Array.from({ length: 28 }, (_, index) => {
    const date = addDays(startDate, index);
    return {
      date,
      key: format(date, 'yyyy-MM-dd'),
      label: format(date, 'd'),
      longLabel: format(date, 'MMM d, yyyy'),
    };
  });
}

export function LearningStreak({ streak, loading = false, className }: Readonly<LearningStreakProps>) {
  if (loading) {
    return (
      <div className={cn('rounded-lg border border-slate-200 bg-white p-5', className)}>
        <p className="text-sm text-slate-500">Loading streak...</p>
      </div>
    );
  }

  if (!streak) {
    return (
      <div className={cn('rounded-lg border border-slate-200 bg-white p-5', className)}>
        <p className="text-sm text-slate-500">No streak data yet. Start learning today to build a streak.</p>
      </div>
    );
  }

  const activityRange = getActivityRange(streak);
  const calendarDays = buildCalendarDays();

  return (
    <div className={cn('rounded-lg border border-slate-200 bg-white p-5 shadow-xs', className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Learning Streak</h3>
          <p className="text-sm text-slate-600">Stay consistent and keep your streak alive.</p>
        </div>
        <Flame className="h-6 w-6 text-orange-500" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-orange-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-orange-600">Current</p>
          <p className="mt-1 text-2xl font-bold text-orange-700">{streak.currentStreakDays}</p>
          <p className="text-xs text-orange-600">days</p>
        </div>
        <div className="rounded-lg bg-amber-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-600">Longest</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{streak.longestStreakDays}</p>
          <p className="text-xs text-amber-600">days</p>
        </div>
        <div className="rounded-lg bg-blue-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-600">Active days</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">{streak.totalActiveDays}</p>
          <p className="text-xs text-blue-600">total</p>
        </div>
      </div>

      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <Calendar className="h-4 w-4" />
            View activity calendar
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            sideOffset={8}
            className="z-50 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900">Last 28 days</h4>
              <span className="text-xs text-slate-500">Today included</span>
            </div>

            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-400">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                <span key={`${day}-${index}`}>{day}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const isActive =
                  !!activityRange &&
                  day.date.getTime() >= activityRange.start.getTime() &&
                  day.date.getTime() <= activityRange.end.getTime();

                return (
                  <div
                    key={day.key}
                    title={`${day.longLabel} - ${isActive ? 'Active' : 'Inactive'}`}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-md border text-xs',
                      isActive
                        ? 'border-emerald-200 bg-emerald-100 text-emerald-700'
                        : 'border-slate-200 bg-slate-50 text-slate-400',
                    )}
                  >
                    {day.label}
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>Current streak started: {streak.streakStartDate ? format(parseISO(streak.streakStartDate), 'MMM d') : 'N/A'}</span>
              <span>Last activity: {streak.lastActivityDate ? format(parseISO(streak.lastActivityDate), 'MMM d') : 'N/A'}</span>
            </div>
            <Popover.Arrow className="fill-white" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
