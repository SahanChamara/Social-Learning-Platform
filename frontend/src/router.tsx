import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from '@/pages/Home';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import Discover from '@/pages/Discover';
import NotFound from '@/pages/NotFound';

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
