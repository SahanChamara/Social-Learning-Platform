import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { AlertCircle, Loader2, Plus, Sparkles, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CourseCard, SearchBar, SkeletonCourseCard } from '@/components';
import { AnimatedPage, Button, EmptyState, PageHeader, StatusBadge } from '@/components/ui';
import { COURSES_QUERY } from '@/graphql';
import { useAuth } from '@/hooks';
import { UserRole } from '@/types/auth';
import { CourseDifficulty, type CoursesQueryVariables, type CoursesResponse } from '@/types/courses';

const PAGE_SIZE = 9;

function CourseCardSkeleton() {
  return <SkeletonCourseCard />;
}

export default function CoursesPage() {
  const { user } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [difficulty, setDifficulty] = useState<CourseDifficulty | ''>('');
  const [page, setPage] = useState(0);

  const canCreateCourses = user?.role === UserRole.CREATOR || user?.role === UserRole.ADMIN;
  const variables: CoursesQueryVariables = {
    searchTerm: searchTerm.trim() ? searchTerm.trim() : undefined,
    difficulty: difficulty || undefined,
    page,
    size: PAGE_SIZE,
  };

  const { data, loading, error, refetch } = useQuery<CoursesResponse, CoursesQueryVariables>(COURSES_QUERY, {
    variables,
    notifyOnNetworkStatusChange: true,
  });

  const courses = data?.courses.content ?? [];
  const coursePage = data?.courses;
  const hasPrevious = coursePage?.hasPrevious ?? false;
  const hasNext = coursePage?.hasNext ?? false;
  const totalElements = coursePage?.totalElements ?? 0;
  const pageNumber = (coursePage?.pageNumber ?? page) + 1;
  const totalPages = coursePage?.totalPages ?? 1;

  const handleSearchSubmit = (term: string) => {
    setPage(0);
    setSearchTerm(term);
  };

  const handleDifficultyChange = (value: string) => {
    setPage(0);
    setDifficulty(value as CourseDifficulty | '');
  };

  const handleClearFilters = () => {
    setPage(0);
    setSearchInput('');
    setSearchTerm('');
    setDifficulty('');
  };

  if (loading && !data) {
    return (
      <AnimatedPage>
        <div className="app-container py-10">
          <div className="mb-8 space-y-2">
            <div className="h-10 w-72 animate-pulse rounded bg-slate-800" />
            <div className="h-5 w-96 animate-pulse rounded bg-slate-800" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: PAGE_SIZE }, (_, value) => `course-skeleton-${value + 1}`).map((skeletonKey) => (
              <CourseCardSkeleton key={skeletonKey} />
            ))}
          </div>
        </div>
      </AnimatedPage>
    );
  }

  if (error && !data) {
    return (
      <AnimatedPage>
        <div className="app-container py-16">
          <EmptyState
            icon={<AlertCircle className="h-6 w-6" />}
            title="Unable to load courses"
            description="We could not fetch courses right now. Please check your connection and try again."
            action={
              <Button
                type="button"
                onClick={() => {
                  void refetch(variables);
                }}
              >
                Retry
              </Button>
            }
          />
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="app-container min-h-[calc(100vh-4.5rem)] py-10">
        <PageHeader
          eyebrow="Course catalog"
          title="Explore practical courses"
          description="Browse cinematic learning paths from creators. Search by topic, filter by level, and open a course to review outcomes, curriculum, and learner feedback."
          actions={
            canCreateCourses ? (
              <Button variant="premium" asChild>
                <Link to="/courses/create">
                  <Plus className="h-4 w-4" />
                  Create Course
                </Link>
              </Button>
            ) : null
          }
        />

        <section className="cinematic-section mb-8 overflow-hidden rounded-3xl p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <StatusBadge tone="violet">
                <Sparkles className="h-3.5 w-3.5" />
                premium course theater
              </StatusBadge>
              <h2 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-slate-50">
                Browse learning paths like a curated streaming library.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
                Featured creator courses, smart filters, and immersive cards help learners choose the next skill path with confidence.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-white/10 bg-white/6 p-5">
                <TrendingUp className="h-5 w-5 text-cyan-200" />
                <p className="mt-6 text-3xl font-black text-slate-50">{totalElements}</p>
                <p className="text-sm text-slate-400">available courses</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/6 p-5">
                <Users className="h-5 w-5 text-violet-200" />
                <p className="mt-6 text-3xl font-black text-slate-50">Live</p>
                <p className="text-sm text-slate-400">creator catalog</p>
              </div>
            </div>
          </div>
        </section>

        <section className="cinematic-section mb-8 rounded-3xl p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              onDebouncedChange={(term) => {
                setPage(0);
                setSearchTerm(term);
              }}
              onSearch={handleSearchSubmit}
              navigateToOnSubmit={null}
              className="flex flex-1 items-center gap-2"
            />

            <select
              value={difficulty}
              onChange={(event) => handleDifficultyChange(event.target.value)}
              className="h-11 rounded-lg border border-slate-700/80 bg-slate-950/45 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
              aria-label="Filter by difficulty"
            >
              <option value="">All Levels</option>
              <option value={CourseDifficulty.BEGINNER}>Beginner</option>
              <option value={CourseDifficulty.INTERMEDIATE}>Intermediate</option>
              <option value={CourseDifficulty.ADVANCED}>Advanced</option>
              <option value={CourseDifficulty.EXPERT}>Expert</option>
            </select>

            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-950/45 px-4 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/60 hover:bg-slate-900"
            >
              Clear
            </button>
          </div>

          <div className="mt-3 text-sm text-slate-400">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Updating results...
              </span>
            ) : (
              <StatusBadge tone="slate">
                {totalElements} course{totalElements === 1 ? '' : 's'} found
              </StatusBadge>
            )}
          </div>
        </section>

        {courses.length > 0 ? (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} href={`/courses/${course.slug}`} className="h-full" />
            ))}
          </section>
        ) : (
          <EmptyState
            title="No courses found"
            description="Try changing your search term or selected level. You can also clear filters to browse the full catalog."
            action={
              <Button type="button" variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            }
          />
        )}

        <footer className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-6 sm:flex-row">
          <p className="text-sm text-slate-400">
            Page {pageNumber} of {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!hasPrevious || loading}
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-950/50 px-4 text-sm font-semibold text-slate-200 transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={!hasNext || loading}
              onClick={() => setPage((prev) => prev + 1)}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-cyan-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </footer>
      </div>
    </AnimatedPage>
  );
}
