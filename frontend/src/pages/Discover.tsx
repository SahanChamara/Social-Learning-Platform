import { useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import * as Tabs from '@radix-ui/react-tabs';
import { Compass, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CourseCard, SkeletonCourseCard } from '@/components';
import { Card, CardContent } from '@/components/ui';
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
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Discover</h1>
          <p className="max-w-3xl text-slate-600">
            Explore trending content, personalized recommendations, and categories to continue your
            learning journey.
          </p>
        </header>

        <Tabs.Root defaultValue="trending" className="space-y-6">
          <Tabs.List className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
            <Tabs.Trigger
              value="trending"
              className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-slate-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <TrendingUp className="h-4 w-4" />
              Trending
            </Tabs.Trigger>
            <Tabs.Trigger
              value="recommended"
              className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-slate-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Sparkles className="h-4 w-4" />
              Recommended
            </Tabs.Trigger>
            <Tabs.Trigger
              value="categories"
              className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-slate-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Compass className="h-4 w-4" />
              Categories
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="trending">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">Trending Courses</h2>
              <Link to="/courses" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
                View all courses
              </Link>
            </div>

            {trendingLoading && !trendingData ? (
              <SectionSkeleton />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {trendingCourses.map((course) => (
                  <CourseCard key={course.id} course={course} href={`/courses/${course.slug}`} />
                ))}
              </div>
            )}
          </Tabs.Content>

          <Tabs.Content value="recommended">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">Recommended for You</h2>
              {!user ? (
                <Link to="/auth/login" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
                  Sign in for personalized picks
                </Link>
              ) : null}
            </div>

            {recommendedLoading && referenceCourseId ? (
              <SectionSkeleton />
            ) : recommendedCourses.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {recommendedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} href={`/courses/${course.slug}`} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center gap-3 py-6 text-slate-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Build your personalized feed by enrolling in a few courses first.
                </CardContent>
              </Card>
            )}
          </Tabs.Content>

          <Tabs.Content value="categories">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">Explore by Category</h2>
              <Link to="/search" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
                Open advanced search
              </Link>
            </div>

            {categoriesLoading && !categoriesData ? (
              <SectionSkeleton />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/search?q=${encodeURIComponent(category.name)}`}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <h3 className="text-lg font-semibold text-slate-900">{category.name}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                      {category.description ?? 'Explore top learning content in this category.'}
                    </p>
                    <p className="mt-3 text-sm font-medium text-blue-700">
                      {category.courseCount} course{category.courseCount === 1 ? '' : 's'}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}
