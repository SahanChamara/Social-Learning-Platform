import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { AlertCircle, Loader2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CourseCard, SearchBar, SkeletonCourseCard } from '@/components';
import { Button, EmptyState, PageHeader } from '@/components/ui';
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
      <div>
        <div className="app-container py-10">
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
      <div>
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
      </div>
    );
  }

  return (
    <div>
      <div className="app-container py-10">
        <PageHeader
          eyebrow="Course catalog"
          title="Explore practical courses"
          description="Browse structured learning paths from creators. Search by topic, filter by level, and open a course to review outcomes, curriculum, and learner feedback."
          actions={
            canCreateCourses ? (
              <Button asChild>
                <Link to="/courses/create">
                  <Plus className="h-4 w-4" />
                  Create Course
                </Link>
              </Button>
            ) : null
          }
        />

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
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
