import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  MessageSquare,
  PlayCircle,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedPage, Button, CourseSurface, SectionHeader, StatusBadge } from '@/components/ui';

const benefits = [
  { icon: BookOpen, title: 'Structured paths', description: 'Move through modules, lessons, outcomes, and progress without guessing what comes next.' },
  { icon: MessageSquare, title: 'Social learning', description: 'Discuss course ideas, ask questions, review creators, and learn with momentum.' },
  { icon: Trophy, title: 'Visible progress', description: 'Track streaks, achievements, completed lessons, and active courses in one polished workspace.' },
];

const stats = [
  ['3.8k+', 'active learners'],
  ['120+', 'creator-led lessons'],
  ['91%', 'course completion lift'],
];

export default function Home() {
  return (
    <AnimatedPage>
      <section className="relative overflow-hidden">
        <div className="app-container grid min-h-[calc(100vh-4rem)] gap-12 py-14 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="max-w-4xl"
          >
            <StatusBadge tone="cyan">
              <Sparkles className="h-3.5 w-3.5" />
              social learning for modern teams
            </StatusBadge>
            <h1 className="mt-6 text-5xl font-black tracking-tight text-slate-50 sm:text-6xl lg:text-7xl">
              Learn faster inside a <span className="text-gradient">beautiful learning command center.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Discover practical courses, follow clean lesson paths, track progress, and learn with a community that keeps every topic alive.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" variant="premium" asChild>
                <Link to="/courses">
                  Browse Courses
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth/register">
                  Start Free
                  <PlayCircle className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
              {stats.map(([value, label]) => (
                <div key={label} className="glass-panel rounded-xl p-4">
                  <p className="text-2xl font-bold text-slate-50">{value}</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: 'easeOut' }}
            className="aurora-border rounded-2xl"
          >
            <div className="cinematic-section rounded-2xl p-4 sm:p-5">
              <div className="overflow-hidden rounded-xl border border-slate-700/70 bg-slate-950/80">
                <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-50">Today&apos;s learning orbit</p>
                    <p className="text-xs text-slate-400">Product design fundamentals</p>
                  </div>
                  <StatusBadge tone="emerald">Live path</StatusBadge>
                </div>

                <div className="grid gap-4 p-5">
                  <div className="rounded-xl bg-linear-to-br from-cyan-300/20 via-blue-500/15 to-violet-500/20 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200">Continue lesson</p>
                        <h2 className="mt-2 text-2xl font-bold text-slate-50">Design systems that scale</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-300">12 minutes left in your next high-impact lesson.</p>
                      </div>
                      <div className="rounded-full bg-white/10 p-3 text-cyan-200">
                        <PlayCircle className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-900/80">
                      <div className="h-full w-[68%] rounded-full bg-linear-to-r from-cyan-300 to-violet-400" />
                    </div>
                  </div>

                  {['Prototype critique', 'Community discussion', 'Achievement unlocked'].map((item, index) => (
                    <div key={item} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-200">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-100">{item}</p>
                        <p className="text-sm text-slate-400">Step {index + 1} in your active learning path</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="app-container pb-16">
        <SectionHeader
          eyebrow="Why learners stay"
          title="A premium product experience around the full learning loop"
          description="The platform combines discovery, structure, progress, and peer feedback so every course feels purposeful from first click to final lesson."
        />

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <CourseSurface key={benefit.title}>
                <Icon className="h-6 w-6 text-cyan-200" />
                <h3 className="mt-5 text-lg font-bold text-slate-50">{benefit.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{benefit.description}</p>
              </CourseSurface>
            );
          })}
        </div>

        <div className="mt-10 rounded-2xl border border-cyan-300/20 bg-linear-to-r from-cyan-300/12 via-blue-500/10 to-violet-500/12 p-6 sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-50">Find the path that fits your next skill leap.</h2>
            <p className="mt-2 text-sm text-slate-400">Browse the catalog or use discovery to surface momentum-building courses.</p>
          </div>
          <Button className="mt-5 sm:mt-0" variant="premium" asChild>
            <Link to="/discover">
              <Compass className="h-4 w-4" />
              Start Discovering
            </Link>
          </Button>
        </div>

        <div className="mt-8 flex items-center gap-3 text-sm text-slate-400">
          <Users className="h-4 w-4 text-emerald-300" />
          Built for learners, creators, and beta communities that care about finishing.
        </div>
      </section>
    </AnimatedPage>
  );
}
