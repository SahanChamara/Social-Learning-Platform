import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from '@/pages/Home';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import Discover from '@/pages/Discover';
import NotFound from '@/pages/NotFound';
import ComponentsDemo from '@/pages/ComponentsDemo';
import AuthDemo from '@/pages/AuthDemo';
import Dashboard from '@/pages/Dashboard';
import LearnerDashboard from '@/pages/LearnerDashboard';
import LessonPage from '@/pages/LessonPage';
import Profile from '@/pages/Profile';
import CoursesPage from '@/pages/CoursesPage';
import SearchPage from '@/pages/SearchPage';
import CourseDetailPage from '@/pages/CourseDetailPage';
import CreateCoursePage from '@/pages/CreateCoursePage';
import { ProtectedRoute } from '@/components/auth';
import { ErrorBoundary } from '@/components';
import { UserRole } from '@/types/auth';

// Router configuration
const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: (
          <ErrorBoundary>
            <Home />
          </ErrorBoundary>
        ),
      },
      {
        path: 'discover',
        element: (
          <ErrorBoundary>
            <Discover />
          </ErrorBoundary>
        ),
      },
      {
        path: 'courses',
        element: (
          <ErrorBoundary>
            <CoursesPage />
          </ErrorBoundary>
        ),
      },
      {
        path: 'search',
        element: (
          <ErrorBoundary>
            <SearchPage />
          </ErrorBoundary>
        ),
      },
      {
        path: 'courses/create',
        element: (
          <ErrorBoundary>
            <ProtectedRoute allowedRoles={[UserRole.CREATOR, UserRole.ADMIN]}>
              <CreateCoursePage />
            </ProtectedRoute>
          </ErrorBoundary>
        ),
      },
      {
        path: 'courses/:slug',
        element: (
          <ErrorBoundary>
            <CourseDetailPage />
          </ErrorBoundary>
        ),
      },
      {
        path: 'courses/:slug/learn/:lessonId',
        element: (
          <ErrorBoundary>
            <ProtectedRoute>
              <LessonPage />
            </ProtectedRoute>
          </ErrorBoundary>
        ),
      },
      {
        path: 'components-demo',
        element: (
          <ErrorBoundary>
            <ComponentsDemo />
          </ErrorBoundary>
        ),
      },
      {
        path: 'auth-demo',
        element: (
          <ErrorBoundary>
            <AuthDemo />
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
                <Login />
              </ErrorBoundary>
            ),
          },
          {
            path: 'register',
            element: (
              <ErrorBoundary>
                <Register />
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
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </ErrorBoundary>
        ),
      },
      {
        path: 'my-learning',
        element: (
          <ErrorBoundary>
            <ProtectedRoute>
              <LearnerDashboard />
            </ProtectedRoute>
          </ErrorBoundary>
        ),
      },
      {
        path: 'profile',
        element: (
          <ErrorBoundary>
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          </ErrorBoundary>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
