import * as HoverCard from '@radix-ui/react-hover-card';
import {
  Award,
  BookOpen,
  Compass,
  Flame,
  Lock,
  Medal,
  Star,
  Timer,
  Trophy,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AchievementBadgeData {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  iconUrl?: string | null;
  badgeColor?: string | null;
  points?: number | null;
}

interface AchievementBadgeProps {
  achievement: AchievementBadgeData;
  unlocked: boolean;
  progressPercentage?: number;
  earnedAt?: string | null;
  className?: string;
}

const ICON_BY_KEY = {
  award: Award,
  medal: Medal,
  trophy: Trophy,
  flame: Flame,
  'book-open': BookOpen,
  compass: Compass,
  timer: Timer,
  star: Star,
} as const;

function resolveIcon(iconUrl?: string | null) {
  if (!iconUrl) {
    return Award;
  }

  const normalized = iconUrl.trim().toLowerCase();
  return ICON_BY_KEY[normalized as keyof typeof ICON_BY_KEY] ?? Award;
}

export function AchievementBadge({
  achievement,
  unlocked,
  progressPercentage = 0,
  earnedAt,
  className,
}: Readonly<AchievementBadgeProps>) {
  const Icon = resolveIcon(achievement.iconUrl);
  const progress = Math.max(0, Math.min(100, progressPercentage));
  const badgeStyle = unlocked && achievement.badgeColor ? { borderColor: achievement.badgeColor } : undefined;

  return (
    <HoverCard.Root openDelay={120} closeDelay={100}>
      <HoverCard.Trigger asChild>
        <button
          type="button"
          className={cn(
            'group relative flex w-full flex-col items-center rounded-xl border bg-white p-4 text-center shadow-xs transition hover:-translate-y-0.5 hover:shadow-md',
            unlocked ? 'border-slate-200' : 'border-slate-200 opacity-80',
            className,
          )}
          style={badgeStyle}
        >
          <div
            className={cn(
              'inline-flex h-12 w-12 items-center justify-center rounded-full border',
              unlocked ? 'border-transparent bg-amber-50 text-amber-600' : 'border-slate-200 bg-slate-100 text-slate-400',
            )}
          >
            {unlocked ? <Icon className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
          </div>

          <p className={cn('mt-3 line-clamp-2 text-sm font-semibold', unlocked ? 'text-slate-900' : 'text-slate-500')}>
            {achievement.name}
          </p>

          <div className="mt-2 w-full">
            <div className="h-1.5 w-full rounded-full bg-slate-200">
              <div
                className={cn('h-1.5 rounded-full transition-all', unlocked ? 'bg-emerald-500' : 'bg-blue-500')}
                style={{ width: `${unlocked ? 100 : progress}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">{unlocked ? 'Unlocked' : `${Math.round(progress)}% complete`}</p>
          </div>
        </button>
      </HoverCard.Trigger>

      <HoverCard.Portal>
        <HoverCard.Content
          side="top"
          align="center"
          className="z-50 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-xl"
        >
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">{achievement.name}</p>
              {achievement.points ? (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                  {achievement.points} pts
                </span>
              ) : null}
            </div>
            <p className="text-sm text-slate-600">
              {achievement.description?.trim() || 'Complete this achievement objective to earn the badge.'}
            </p>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{achievement.category || 'General'}</span>
              {unlocked && earnedAt ? (
                <span>Earned {new Date(earnedAt).toLocaleDateString()}</span>
              ) : (
                <span>{Math.round(progress)}% progress</span>
              )}
            </div>
          </div>
          <HoverCard.Arrow className="fill-white" />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}
