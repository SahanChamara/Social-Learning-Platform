import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Compass, MessageSquare, Trophy } from 'lucide-react';
import { Button } from '@/components/ui';

export default function Home() {
  return (
    <div>
      <section className="border-b border-slate-200 bg-white">
        <div className="app-container grid gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Social Learning Platform</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Learn with structure, progress, and community
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Discover practical courses, complete lessons step by step, and learn alongside people working toward the same goals.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link to="/courses">
                  Browse Courses
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/discover">Explore Discover</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="rounded-lg bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-950">Your next learning path</p>
                  <p className="text-sm text-slate-500">Structured courses, progress, and discussion</p>
                </div>
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div className="mt-5 space-y-4">
                {['Choose a practical course', 'Complete lessons in order', 'Discuss and review what you learn'].map((item, index) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                      {index + 1}
                    </div>
                    <p className="text-sm font-medium text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="app-container py-12">
        <div className="grid gap-5 md:grid-cols-3">
          <Link to="/courses" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <h2 className="mt-4 text-lg font-semibold text-slate-950">Structured Courses</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Follow modules and lessons in a clear order, with outcomes visible before you enroll.
            </p>
          </Link>

          <Link to="/dashboard" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <Trophy className="h-6 w-6 text-amber-500" />
            <h2 className="mt-4 text-lg font-semibold text-slate-950">Learning Progress</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Track enrolled courses, completed lessons, streaks, and achievements from one place.
            </p>
          </Link>

          <Link to="/discover" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <MessageSquare className="h-6 w-6 text-emerald-600" />
            <h2 className="mt-4 text-lg font-semibold text-slate-950">Social Feedback</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Ask questions, reply to learners, like helpful comments, and rate courses after learning.
            </p>
          </Link>
        </div>

        <div className="mt-10 rounded-xl border border-blue-100 bg-blue-50 p-6 sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Not sure where to begin?</h2>
            <p className="mt-2 text-sm text-slate-600">Use discovery to find trending courses and learning categories.</p>
          </div>
          <Button className="mt-5 sm:mt-0" asChild>
            <Link to="/discover">
              <Compass className="h-4 w-4" />
              Start Discovering
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
