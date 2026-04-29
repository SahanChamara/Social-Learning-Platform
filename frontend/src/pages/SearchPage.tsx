import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import * as Accordion from '@radix-ui/react-accordion';
import { AlertCircle, ChevronDown, Loader2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { CourseCard, SearchBar } from '@/components';
import { CATEGORIES_QUERY, COURSES_QUERY, SEARCH_QUERY } from '@/graphql';
import {
  CourseDifficulty,
  GraphqlCourseSortBy,
  SortDirection,
  type CategoriesResponse,
  type CoursesQueryVariables,
  type CoursesResponse,
  type SearchResponse,
  type SearchResultNode,
  type SearchQueryVariables,
} from '@/types/courses';

const PAGE_SIZE = 12;

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = (searchParams.get('q') ?? '').trim();

  const [searchInput, setSearchInput] = useState(initialQuery);
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<CourseDifficulty[]>([]);
  const [sortBy, setSortBy] = useState<GraphqlCourseSortBy>(GraphqlCourseSortBy.RELEVANCE);
  const [sortDirection, setSortDirection] = useState<SortDirection>(SortDirection.DESC);
  const [page, setPage] = useState(0);
  const [allCourses, setAllCourses] = useState<CoursesResponse['courses']['content']>([]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const activeCategoryId = selectedCategoryIds[0];
  const activeDifficulty = selectedDifficulties[0];

  const variables: CoursesQueryVariables = {
    searchTerm: searchTerm || undefined,
    categoryId: activeCategoryId,
    difficulty: activeDifficulty,
    sortBy,
    sortDirection,
    page,
    size: PAGE_SIZE,
  };

  const {
    data: coursesData,
    loading: coursesLoading,
    error: coursesError,
  } = useQuery<CoursesResponse, CoursesQueryVariables>(COURSES_QUERY, {
    variables,
    notifyOnNetworkStatusChange: true,
  });

  const { data: categoriesData } = useQuery<CategoriesResponse>(CATEGORIES_QUERY);

  const { data: searchData } = useQuery<SearchResponse, SearchQueryVariables>(SEARCH_QUERY, {
    variables: {
      query: searchTerm,
      first: 20,
    },
    skip: !searchTerm,
  });

  useEffect(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (searchTerm) {
        next.set('q', searchTerm);
      } else {
        next.delete('q');
      }
      return next;
    }, { replace: true });
  }, [searchTerm, setSearchParams]);

  useEffect(() => {
    const nextQuery = (searchParams.get('q') ?? '').trim();
    setSearchInput(nextQuery);
    setSearchTerm(nextQuery);
  }, [searchParams]);

  useEffect(() => {
    if (!coursesData?.courses) {
      return;
    }

    const incoming = coursesData.courses.content;
    if (page === 0) {
      setAllCourses(incoming);
      return;
    }

    setAllCourses((prev) => {
      const seen = new Set(prev.map((course) => course.id));
      const merged = [...prev];
      incoming.forEach((course) => {
        if (!seen.has(course.id)) {
          merged.push(course);
          seen.add(course.id);
        }
      });
      return merged;
    });
  }, [coursesData, page]);

  const hasNext = coursesData?.courses.hasNext ?? false;

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNext || coursesLoading) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setPage((prev) => prev + 1);
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [coursesLoading, hasNext]);

  const handleSearch = (value: string) => {
    setPage(0);
    setAllCourses([]);
    setSearchTerm(value.trim());
  };

  const toggleSingleSelect = (current: string[], nextValue: string) => {
    if (current.includes(nextValue)) {
      return [];
    }
    return [nextValue];
  };

  const mixedNodes: SearchResultNode[] = useMemo(() => {
    if (!searchData?.search.edges) {
      return [];
    }
    return searchData.search.edges.map((edge) => edge.node);
  }, [searchData]);

  const categories = mixedNodes.filter((node) => node.__typename === 'Category');
  const tags = mixedNodes.filter((node) => node.__typename === 'Tag');

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Search</h1>
          <p className="text-slate-600">
            Find relevant courses with filters, sorting, and continuous scrolling.
          </p>
          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            onDebouncedChange={handleSearch}
            onSearch={handleSearch}
            navigateToOnSubmit={null}
            className="flex w-full items-center gap-2"
          />
        </header>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Filters</h2>
            <Accordion.Root type="multiple" className="space-y-3">
              <Accordion.Item value="categories" className="rounded-lg border border-slate-200">
                <Accordion.Trigger className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-slate-800">
                  Categories <ChevronDown className="h-4 w-4" />
                </Accordion.Trigger>
                <Accordion.Content className="space-y-2 px-3 pb-3">
                  {(categoriesData?.categories ?? []).slice(0, 10).map((category) => (
                    <label key={category.id} className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={selectedCategoryIds.includes(category.id)}
                        onChange={() => {
                          setSelectedCategoryIds((prev) => toggleSingleSelect(prev, category.id));
                          setPage(0);
                          setAllCourses([]);
                        }}
                      />
                      {category.name}
                    </label>
                  ))}
                </Accordion.Content>
              </Accordion.Item>

              <Accordion.Item value="difficulty" className="rounded-lg border border-slate-200">
                <Accordion.Trigger className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-slate-800">
                  Difficulty <ChevronDown className="h-4 w-4" />
                </Accordion.Trigger>
                <Accordion.Content className="space-y-2 px-3 pb-3">
                  {Object.values(CourseDifficulty).map((difficulty) => (
                    <label key={difficulty} className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={selectedDifficulties.includes(difficulty)}
                        onChange={() => {
                          setSelectedDifficulties((prev) => toggleSingleSelect(prev, difficulty) as CourseDifficulty[]);
                          setPage(0);
                          setAllCourses([]);
                        }}
                      />
                      {difficulty}
                    </label>
                  ))}
                </Accordion.Content>
              </Accordion.Item>
            </Accordion.Root>

            <div className="mt-4 space-y-2">
              <label htmlFor="sortBy" className="block text-sm font-medium text-slate-800">
                Sort by
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value as GraphqlCourseSortBy);
                  setPage(0);
                  setAllCourses([]);
                }}
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800"
              >
                <option value={GraphqlCourseSortBy.RELEVANCE}>Relevance</option>
                <option value={GraphqlCourseSortBy.RATING}>Top Rated</option>
                <option value={GraphqlCourseSortBy.ENROLLMENT}>Most Enrolled</option>
                <option value={GraphqlCourseSortBy.DATE}>Newest</option>
              </select>
            </div>

            <div className="mt-3 space-y-2">
              <label htmlFor="sortDirection" className="block text-sm font-medium text-slate-800">
                Direction
              </label>
              <select
                id="sortDirection"
                value={sortDirection}
                onChange={(event) => {
                  setSortDirection(event.target.value as SortDirection);
                  setPage(0);
                  setAllCourses([]);
                }}
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800"
              >
                <option value={SortDirection.DESC}>Descending</option>
                <option value={SortDirection.ASC}>Ascending</option>
              </select>
            </div>
          </aside>

          <section className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Courses</h2>
                <span className="text-sm text-slate-600">
                  {coursesData?.courses.totalElements ?? 0} results
                </span>
              </div>

              {coursesError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                  <div className="inline-flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Failed to load search results.
                  </div>
                </div>
              ) : null}

              {allCourses.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {allCourses.map((course) => (
                    <CourseCard key={course.id} course={course} href={`/courses/${course.slug}`} />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-600">
                  No matching courses found.
                </div>
              )}

              <div ref={sentinelRef} className="h-8" />

              {coursesLoading ? (
                <div className="inline-flex items-center gap-2 text-sm text-slate-600">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading more...
                </div>
              ) : null}
            </div>

            {searchTerm ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-lg font-semibold text-slate-900">Related results</h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                      Categories
                    </h4>
                    {categories.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {categories.slice(0, 8).map((node) => (
                          <button
                            key={node.id}
                            type="button"
                            onClick={() => {
                              setSelectedCategoryIds([node.id]);
                              setPage(0);
                              setAllCourses([]);
                            }}
                            className="rounded-full border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-100"
                          >
                            {node.name}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-600">No category matches.</p>
                    )}
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                      Tags
                    </h4>
                    {tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {tags.slice(0, 10).map((node) => (
                          <span
                            key={node.id}
                            className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                          >
                            #{node.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-600">No tag matches.</p>
                    )}
                  </div>
                </div>

                <p className="mt-4 text-xs text-slate-500">
                  User and tutorial entity search will appear here once those backend search entities are available.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
                Try searching for a topic, then refine results with the filter panel.
                <Link to="/courses" className="ml-1 font-semibold text-blue-700 hover:text-blue-800">
                  Browse all courses
                </Link>
                .
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
