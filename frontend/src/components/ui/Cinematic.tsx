import type { ElementType, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function AnimatedPage({
  children,
  className,
}: Readonly<{ children: ReactNode; className?: string }>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className={cn('cinematic-page noise-layer', className)}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  className,
}: Readonly<{ eyebrow?: string; title: string; description?: string; className?: string }>) {
  return (
    <div className={cn('max-w-5xl', className)}>
      {eyebrow ? <p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">{eyebrow}</p> : null}
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">{title}</h2>
      {description ? <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">{description}</p> : null}
    </div>
  );
}

export function StatusBadge({
  children,
  tone = 'cyan',
  className,
}: Readonly<{ children: ReactNode; tone?: 'cyan' | 'violet' | 'emerald' | 'gold' | 'slate'; className?: string }>) {
  const tones = {
    cyan: 'border-cyan-300/25 bg-cyan-300/10 text-cyan-200',
    violet: 'border-violet-300/25 bg-violet-300/10 text-violet-200',
    emerald: 'border-emerald-300/25 bg-emerald-300/10 text-emerald-200',
    gold: 'border-amber-300/25 bg-amber-300/10 text-amber-200',
    slate: 'border-slate-600/70 bg-slate-800/70 text-slate-300',
  };

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-md', tones[tone], className)}>
      {children}
    </span>
  );
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  tone = 'cyan',
}: Readonly<{ label: string; value: ReactNode; icon: ElementType; tone?: 'cyan' | 'violet' | 'emerald' | 'gold' }>) {
  const tones = {
    cyan: 'from-cyan-300/20 text-cyan-200',
    violet: 'from-violet-300/20 text-violet-200',
    emerald: 'from-emerald-300/20 text-emerald-200',
    gold: 'from-amber-300/20 text-amber-200',
  };

  return (
    <div className="glass-panel rounded-3xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <div className="mt-2 text-2xl font-bold text-slate-50">{value}</div>
        </div>
        <div className={cn('rounded-lg bg-linear-to-br to-transparent p-3', tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function CourseSurface({
  children,
  className,
}: Readonly<{ children: ReactNode; className?: string }>) {
  return <div className={cn('glass-panel rounded-3xl p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/35 hover:shadow-cyan-500/10', className)}>{children}</div>;
}
