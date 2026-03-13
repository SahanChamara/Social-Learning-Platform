import { type FormEvent, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { AlertCircle, Loader2, Search } from 'lucide-react';
import { CourseCard } from '@/components';
import { COURSES_QUERY } from '@/graphql';
import { CourseDifficulty, type CoursesQueryVariables, type CoursesResponse } from '@/types/courses';

const PAGE_SIZE = 9;

function CourseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="aspect-video animate-pulse bg-slate-200" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
        <div className="h-5 w-4/5 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [difficulty, setDifficulty] = useState<CourseDifficulty | ''>('');
  const [page, setPage] = useState(0);

  const variables: CoursesQueryVariables = {
    searchTerm: searchTerm.trim() ? searchTerm.trim() : undefined,
    difficulty: difficulty || undefined,
    page,
    size: PAGE_SIZE,
  };

  const { data, loading, error, refetch } = useQuery<CoursesResponse, CoursesQueryVariables>(
    COURSES_QUERY,
    {
      variables,
      notifyOnNetworkStatusChange: true,
    },
  );

  const courses = data?.courses.content ?? [];
  const coursePage = data?.courses;

  const hasPrevious = coursePage?.hasPrevious ?? false;
  const hasNext = coursePage?.hasNext ?? false;
  const totalElements = coursePage?.totalElements ?? 0;
  const pageNumber = (coursePage?.pageNumber ?? page) + 1;
  const totalPages = coursePage?.totalPages ?? 1;

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(0);
    setSearchTerm(searchInput);
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
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 space-y-2">
            <div className="h-10 w-72 animate-pulse rounded bg-slate-200" />
            <div className="h-5 w-96 animate-pulse rounded bg-slate-200" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: PAGE_SIZE }, (_, value) => `course-skeleton-${value + 1}`).map(
              (skeletonKey) => (
                <CourseCardSkeleton key={skeletonKey} />
              ),
            )}
          </div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="mb-2 text-2xl font-semibold text-slate-900">Unable to load courses</h1>
          <p className="mb-6 text-slate-600">
            We could not fetch courses right now. Please check your connection and try again.
          </p>
          <button
            type="button"
            onClick={() => {
              void refetch(variables);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-3">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Explore Courses</h1>
          <p className="max-w-2xl text-slate-600">
            Browse curated learning experiences from creators across design, development, business, and more.
          </p>
        </header>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by title, keyword, or topic"
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Search
              </button>
            </form>

            <select
              value={difficulty}
              onChange={(event) => handleDifficultyChange(event.target.value)}
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
              className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Clear
            </button>
          </div>

          <div className="mt-3 text-sm text-slate-600">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Updating results...
              </span>
            ) : (
              <span>
                {totalElements} course{totalElements === 1 ? '' : 's'} found
              </span>
            )}
          </div>
        </section>

        {courses.length > 0 ? (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                href={`/courses/${course.slug}`}
                className="h-full"
              />
            ))}
          </section>
        ) : (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="text-xl font-semibold text-slate-900">No courses found</h2>
            <p className="mt-2 text-slate-600">
              Try changing your search term or filter to discover more courses.
            </p>
          </section>
        )}

        <footer className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row">
          <p className="text-sm text-slate-600">
            Page {pageNumber} of {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!hasPrevious || loading}
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={!hasNext || loading}
              onClick={() => setPage((prev) => prev + 1)}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
