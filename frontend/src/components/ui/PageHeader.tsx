import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ eyebrow, title, description, actions, className }: Readonly<PageHeaderProps>) {
  return (
    <header className={cn('mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="max-w-5xl space-y-3">
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">{eyebrow}</p>
        ) : null}
        <h1 className="text-4xl font-black tracking-tight text-slate-50 sm:text-5xl">{title}</h1>
        {description ? <p className="text-base leading-7 text-slate-400">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
    </header>
  );
}
