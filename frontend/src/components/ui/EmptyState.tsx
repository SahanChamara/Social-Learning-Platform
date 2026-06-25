import type { ReactNode } from 'react';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: Readonly<EmptyStateProps>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-dashed border-slate-700/80 bg-slate-950/45 px-6 py-10 text-center shadow-2xl shadow-black/15 backdrop-blur',
        className,
      )}
    >
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
        {icon ?? <BookOpen className="h-6 w-6" />}
      </div>
      <h2 className="text-lg font-semibold text-slate-50">{title}</h2>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">{description}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
