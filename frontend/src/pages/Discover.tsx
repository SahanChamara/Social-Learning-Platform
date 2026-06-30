import { useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import * as Tabs from '@radix-ui/react-tabs';
import { BookOpen, Compass, Sparkles, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CourseCard, SkeletonCourseCard } from '@/components';
import { AnimatedPage, Button, CourseSurface, EmptyState, PageHeader, StatusBadge } from '@/components/ui';
import {
  CATEGORIES_QUERY,
  MY_ENROLLMENTS_QUERY,
  RECOMMENDED_COURSES_QUERY,
  TRENDING_COURSES_QUERY,
} from '@/graphql';
import { useAuth } from '@/hooks';
import type {
  CategoriesResponse,
  MyEnrollmentsResponse,
  RecommendedCoursesQueryVariables,
  RecommendedCoursesResponse,
  TrendingCoursesResponse,
} from '@/types/courses';

const TRENDING_LIMIT = 9;
const RECOMMENDED_LIMIT = 9;

function SectionSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => `discover-skeleton-${index}`).map((key) => (
        <SkeletonCourseCard key={key} />
      ))}
    </div>
  );
}

export default function Discover() {
  const { user } = useAuth();

  const { data: trendingData, loading: trendingLoading } = useQuery<TrendingCoursesResponse>(
    TRENDING_COURSES_QUERY,
    {
      variables: { limit: TRENDING_LIMIT },
      fetchPolicy: 'cache-and-network',
    },
  );

  const { data: categoriesData, loading: categoriesLoading } =
    useQuery<CategoriesResponse>(CATEGORIES_QUERY);

  const { data: enrollmentsData } = useQuery<MyEnrollmentsResponse>(MY_ENROLLMENTS_QUERY, {
    skip: !user,
    fetchPolicy: 'cache-and-network',
  });

  const referenceCourseId = useMemo(() => {
    if (!enrollmentsData?.myEnrollments?.length) {
      return undefined;
    }

    return enrollmentsData.myEnrollments[0]?.course.id;
  }, [enrollmentsData]);

  const { data: recommendedData, loading: recommendedLoading } = useQuery<
    RecommendedCoursesResponse,
    RecommendedCoursesQueryVariables
  >(RECOMMENDED_COURSES_QUERY, {
    variables: {
      courseId: referenceCourseId ?? '',
      limit: RECOMMENDED_LIMIT,
    },
    skip: !referenceCourseId,
    fetchPolicy: 'cache-and-network',
  });

  const trendingCourses = trendingData?.trendingCourses ?? [];
  const personalizedCourses = recommendedData?.recommendedCourses ?? [];
  const fallbackRecommended = trendingCourses.slice(0, RECOMMENDED_LIMIT);
  const recommendedCourses = personalizedCourses.length > 0 ? personalizedCourses : fallbackRecommended;
  const categories = categoriesData?.categories ?? [];

  return (
    <AnimatedPage>
      <div className="app-container min-h-[calc(100vh-4.5rem)] py-10">
        <PageHeader
          eyebrow="Discover"
          title="Find your next learning path"
          description="Explore trending courses, browse categories, and get recommendations based on what you are already learning."
          actions={
            <Button variant="outline" asChild>
              <Link to="/search">Open Search</Link>
            </Button>
          }
        />

        <section className="cinematic-section mb-8 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <StatusBadge tone="violet">Streaming shelves for skills</StatusBadge>
              <h2 className="mt-4 max-w-3xl text-3xl font-black tracking-tight text-slate-50 sm:text-4xl">
                Trending cohorts, recommended paths, and categories in one discovery space.
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-white/6 p-4">
                <p className="text-2xl font-black text-slate-50">{trendingCourses.length}</p>
                <p className="text-xs text-slate-400">trending</p>
              </div>
              <div className="rounded-2xl bg-white/6 p-4">
                <p className="text-2xl font-black text-slate-50">{recommendedCourses.length}</p>
                <p className="text-xs text-slate-400">matched</p>
              </div>
              <div className="rounded-2xl bg-white/6 p-4">
                <p className="text-2xl font-black text-slate-50">{categories.length}</p>
                <p className="text-xs text-slate-400">categories</p>
              </div>
            </div>
          </div>
        </section>

        <Tabs.Root defaultValue="trending" className="space-y-6">
          <Tabs.List className="flex w-full gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-white/6 p-1 backdrop-blur-xl sm:inline-flex sm:w-auto">
            <Tabs.Trigger
              value="trending"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-slate-400 data-[state=active]:bg-cyan-300 data-[state=active]:text-slate-950"
            >
              <TrendingUp className="h-4 w-4" />
              Trending
            </Tabs.Trigger>
            <Tabs.Trigger
              value="recommended"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-slate-400 data-[state=active]:bg-cyan-300 data-[state=active]:text-slate-950"
            >
              <Sparkles className="h-4 w-4" />
              Recommended
            </Tabs.Trigger>
            <Tabs.Trigger
              value="categories"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-slate-400 data-[state=active]:bg-cyan-300 data-[state=active]:text-slate-950"
            >
              <Compass className="h-4 w-4" />
              Categories
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="trending">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-50">Trending Courses</h2>
              <Link to="/courses" className="text-sm font-semibold text-cyan-200 hover:text-cyan-100">
                View all courses
              </Link>
            </div>

            {trendingLoading && !trendingData ? (
              <SectionSkeleton />
            ) : trendingCourses.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {trendingCourses.map((course) => (
                  <CourseCard key={course.id} course={course} href={`/courses/${course.slug}`} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<TrendingUp className="h-6 w-6" />}
                title="No trending courses yet"
                description="Trending courses will appear here as learners start enrolling and engaging with content."
                action={<Button asChild><Link to="/courses">Browse Courses</Link></Button>}
              />
            )}
          </Tabs.Content>

          <Tabs.Content value="recommended">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-50">Recommended for You</h2>
              {!user ? (
                <Link to="/auth/login" className="text-sm font-semibold text-cyan-200 hover:text-cyan-100">
                  Sign in for personalized picks
                </Link>
              ) : null}
            </div>

            {recommendedLoading && referenceCourseId ? (
              <SectionSkeleton />
            ) : recommendedCourses.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {recommendedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} href={`/courses/${course.slug}`} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Sparkles className="h-6 w-6" />}
                title="Recommendations need a starting point"
                description="Enroll in a course first, then this area can show more relevant next steps."
                action={<Button asChild><Link to="/courses">Find a Course</Link></Button>}
              />
            )}
          </Tabs.Content>

          <Tabs.Content value="categories">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-50">Explore by Category</h2>
              <Link to="/search" className="text-sm font-semibold text-cyan-200 hover:text-cyan-100">
                Open advanced search
              </Link>
            </div>

            {categoriesLoading && !categoriesData ? (
              <SectionSkeleton />
            ) : categories.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {categories.map((category) => (
                  <CourseSurface
                    key={category.id}
                    className="block"
                  >
                    <Link to={`/search?q=${encodeURIComponent(category.name)}`} className="block">
                    <h3 className="text-lg font-semibold text-slate-50">{category.name}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                      {category.description ?? 'Explore top learning content in this category.'}
                    </p>
                    <p className="mt-3 text-sm font-medium text-cyan-200">
                      {category.courseCount} course{category.courseCount === 1 ? '' : 's'}
                    </p>
                    </Link>
                  </CourseSurface>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<BookOpen className="h-6 w-6" />}
                title="No categories available"
                description="Categories will appear after the first courses and learning areas are added."
                action={<Button asChild><Link to="/courses">Browse Courses</Link></Button>}
              />
            )}
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </AnimatedPage>
  );
}
