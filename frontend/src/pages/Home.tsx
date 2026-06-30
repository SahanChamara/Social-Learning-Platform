import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  Flame,
  MessageSquare,
  PlayCircle,
  Radio,
  Sparkles,
  Star,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedPage, Button, CourseSurface, SectionHeader, StatusBadge } from '@/components/ui';

const stats = [
  ['28k+', 'learning hours'],
  ['3.8k+', 'active learners'],
  ['420+', 'courses shipped'],
  ['120+', 'expert creators'],
];

const journey = [
  { title: 'Enroll', detail: 'Pick a path with clear outcomes.', icon: BookOpen },
  { title: 'Learn', detail: 'Move through focused lessons.', icon: PlayCircle },
  { title: 'Discuss', detail: 'Ask, answer, and compare notes.', icon: MessageSquare },
  { title: 'Build', detail: 'Turn concepts into visible projects.', icon: Zap },
  { title: 'Achieve', detail: 'Earn streaks, XP, and milestones.', icon: Trophy },
];

const community = [
  ['Live discussion', 'How should beginners structure a React portfolio?', '42 replies'],
  ['Trending lesson', 'Design systems that scale across product teams', '1.8k learners'],
  ['Creator highlight', 'Maya Chen published a Product Analytics sprint', 'New today'],
];

const achievements = [
  { label: '7 day streak', value: 'On fire', icon: Flame },
  { label: 'Prototype badge', value: 'Unlocked', icon: BadgeCheck },
  { label: 'Peer mentor', value: 'Top 5%', icon: Star },
];

export default function Home() {
  return (
    <AnimatedPage>
      <section className="relative overflow-hidden">
        <div className="app-container grid min-h-[calc(100vh-4.5rem)] gap-10 py-14 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-18">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="max-w-5xl"
          >
            <StatusBadge tone="cyan">
              <Sparkles className="h-3.5 w-3.5" />
              social courses, creator notes, community signal
            </StatusBadge>
            <h1 className="mt-7 max-w-5xl text-6xl font-black leading-[0.95] tracking-tight text-slate-50 sm:text-7xl lg:text-8xl">
              Learning that <span className="text-gradient">feels alive.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              LearnVerse blends Udemy structure, Medium depth, and Reddit-style discussion into one premium learning space for learners, creators, and communities.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" variant="premium" asChild>
                <Link to="/courses">
                  Explore courses
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth/register">
                  Start learning
                  <PlayCircle className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease: 'easeOut' }}
            className="relative min-h-[34rem]"
          >
            <div className="aurora-border absolute left-2 top-6 w-[86%] rounded-3xl">
              <div className="cinematic-section overflow-hidden rounded-3xl p-4">
                <div className="aspect-[1.55] rounded-2xl bg-linear-to-br from-cyan-300/20 via-sky-500/12 to-violet-500/25 p-5">
                  <div className="flex items-center justify-between">
                    <StatusBadge tone="emerald">
                      <Radio className="h-3.5 w-3.5" />
                      Live cohort
                    </StatusBadge>
                    <span className="text-xs font-semibold text-slate-300">68% complete</span>
                  </div>
                  <div className="mt-20 max-w-md">
                    <p className="text-sm font-semibold uppercase tracking-wide text-cyan-200">Featured path</p>
                    <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-50">Product Design Systems</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-300">12 lessons, weekly critique, project milestones, and active creator feedback.</p>
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="glass-panel absolute right-0 top-0 w-64 rounded-3xl p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-200">Community pulse</p>
              <p className="mt-3 text-lg font-bold text-slate-50">"This module finally made design tokens click."</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                <Users className="h-4 w-4 text-cyan-200" />
                18 learners discussing now
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="glass-panel absolute bottom-6 left-0 w-72 rounded-3xl p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-50">Today&apos;s mission</p>
                  <p className="mt-1 text-xs text-slate-400">Complete lesson 4 and answer one peer question.</p>
                </div>
                <div className="rounded-2xl bg-cyan-300/12 p-3 text-cyan-200">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-900/80">
                <div className="h-full w-[72%] rounded-full bg-linear-to-r from-cyan-300 to-violet-400" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="app-container py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([value, label], index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: index * 0.05, duration: 0.35 }}
              className="glass-panel rounded-3xl p-5"
            >
              <p className="text-4xl font-black tracking-tight text-slate-50">{value}</p>
              <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-slate-400">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="app-container py-16">
        <SectionHeader
          eyebrow="Learning journey"
          title="From first lesson to visible momentum"
          description="A complete loop for discovery, structured learning, conversation, project building, and recognition."
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-5">
          {journey.map((step, index) => {
            const Icon = step.icon;
            return (
              <CourseSurface key={step.title} className="min-h-52">
                <div className="flex items-center justify-between">
                  <div className="rounded-2xl bg-cyan-300/10 p-3 text-cyan-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-black text-slate-600">0{index + 1}</span>
                </div>
                <h3 className="mt-8 text-xl font-bold text-slate-50">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{step.detail}</p>
              </CourseSurface>
            );
          })}
        </div>
      </section>

      <section className="app-container grid gap-6 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <SectionHeader
          eyebrow="Community"
          title="The course is only half the signal"
          description="Discussions, trending lessons, creator updates, reviews, and peer feedback make the platform feel active after every lesson."
        />
        <div className="space-y-4">
          {community.map(([label, title, meta]) => (
            <CourseSurface key={title} className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">{label}</p>
                <h3 className="mt-2 text-lg font-bold text-slate-50">{title}</h3>
              </div>
              <StatusBadge tone="violet" className="shrink-0">{meta}</StatusBadge>
            </CourseSurface>
          ))}
        </div>
      </section>

      <section className="app-container pb-20">
        <div className="cinematic-section rounded-3xl p-6 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <StatusBadge tone="gold">
                <Trophy className="h-3.5 w-3.5" />
                achievement layer
              </StatusBadge>
              <h2 className="mt-5 text-4xl font-black tracking-tight text-slate-50">Progress you can feel.</h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-400">
                Streaks, XP, milestones, badges, and learner profiles turn invisible effort into visible momentum.
              </p>
              <Button className="mt-7" variant="premium" asChild>
                <Link to="/dashboard">
                  Open learner dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {achievements.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-3xl border border-white/10 bg-white/6 p-5">
                    <Icon className="h-6 w-6 text-cyan-200" />
                    <p className="mt-8 text-sm text-slate-400">{item.label}</p>
                    <p className="mt-2 text-2xl font-black text-slate-50">{item.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </AnimatedPage>
  );
}
