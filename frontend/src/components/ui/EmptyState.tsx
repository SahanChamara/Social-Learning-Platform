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
        'rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center',
        className,
      )}
    >
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
        {icon ?? <BookOpen className="h-6 w-6" />}
      </div>
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
