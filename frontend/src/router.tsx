import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from '@/pages/Home';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import Discover from '@/pages/Discover';
import NotFound from '@/pages/NotFound';
import ComponentsDemo from '@/pages/ComponentsDemo';
import AuthDemo from '@/pages/AuthDemo';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import CoursesPage from '@/pages/CoursesPage';
import CourseDetailPage from '@/pages/CourseDetailPage';
import CreateCoursePage from '@/pages/CreateCoursePage';
import { ProtectedRoute } from '@/components/auth';
import { UserRole } from '@/types/auth';

// Router configuration
const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'discover',
        element: <Discover />,
      },
      {
        path: 'courses',
        element: <CoursesPage />,
      },
      {
        path: 'courses/create',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.CREATOR, UserRole.ADMIN]}>
            <CreateCoursePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'courses/:slug',
        element: <CourseDetailPage />,
      },
      {
        path: 'components-demo',
        element: <ComponentsDemo />,
      },
      {
        path: 'auth-demo',
        element: <AuthDemo />,
      },
      {
        path: 'auth',
        children: [
          {
            path: 'login',
            element: <Login />,
          },
          {
            path: 'register',
            element: <Register />,
          },
        ],
      },
      // Protected Routes - Require Authentication
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
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
