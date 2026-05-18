import { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
const Home = lazy(() => import('@/pages/Home'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const Discover = lazy(() => import('@/pages/Discover'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const ComponentsDemo = lazy(() => import('@/pages/ComponentsDemo'));
const AuthDemo = lazy(() => import('@/pages/AuthDemo'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const LearnerDashboard = lazy(() => import('@/pages/LearnerDashboard'));
const LessonPage = lazy(() => import('@/pages/LessonPage'));
const Profile = lazy(() => import('@/pages/Profile'));
const CoursesPage = lazy(() => import('@/pages/CoursesPage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const CourseDetailPage = lazy(() => import('@/pages/CourseDetailPage'));
const CreateCoursePage = lazy(() => import('@/pages/CreateCoursePage'));
import { ProtectedRoute } from '@/components/auth';
import { ErrorBoundary } from '@/components';
import { UserRole } from '@/types/auth';
import AppShell from '@/components/layout/AppShell';

// Router configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: (
          <ErrorBoundary>
            <Suspense fallback={<div className="p-8">Loading...</div>}>
              <Home />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'discover',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<div className="p-8">Loading...</div>}>
              <Discover />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'courses',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<div className="p-8">Loading...</div>}>
              <CoursesPage />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'search',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<div className="p-8">Loading...</div>}>
              <SearchPage />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'courses/create',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<div className="p-8">Loading...</div>}>
              <ProtectedRoute allowedRoles={[UserRole.CREATOR, UserRole.ADMIN]}>
                <CreateCoursePage />
              </ProtectedRoute>
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'courses/:slug',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<div className="p-8">Loading...</div>}>
              <CourseDetailPage />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'courses/:slug/learn/:lessonId',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<div className="p-8">Loading...</div>}>
              <ProtectedRoute>
                <LessonPage />
              </ProtectedRoute>
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'components-demo',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<div className="p-8">Loading...</div>}>
              <ComponentsDemo />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'auth-demo',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<div className="p-8">Loading...</div>}>
              <AuthDemo />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'auth',
        children: [
          {
            path: 'login',
            element: (
              <ErrorBoundary>
                <Suspense fallback={<div className="p-8">Loading...</div>}>
                  <Login />
                </Suspense>
              </ErrorBoundary>
            ),
          },
          {
            path: 'register',
            element: (
              <ErrorBoundary>
                <Suspense fallback={<div className="p-8">Loading...</div>}>
                  <Register />
                </Suspense>
              </ErrorBoundary>
            ),
          },
        ],
      },
      // Protected Routes - Require Authentication
      {
        path: 'dashboard',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<div className="p-8">Loading...</div>}>
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'my-learning',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<div className="p-8">Loading...</div>}>
              <ProtectedRoute>
                <LearnerDashboard />
              </ProtectedRoute>
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'profile',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<div className="p-8">Loading...</div>}>
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            </Suspense>
          </ErrorBoundary>
        ),
      },
    ],
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<div className="p-8">Loading...</div>}>
        <NotFound />
      </Suspense>
    ),
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
