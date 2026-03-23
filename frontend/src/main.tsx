import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Outlet, RouterProvider, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import LoginRoute from './routes/login.tsx'
import SignInRoute from './routes/signin.tsx'
import FeedRoute from './routes/feed.tsx'
import CreatePostRoute from './components/CreatePost.tsx'
import SidebarRoute from './routes/sidebar.tsx'
import ProfileRoute from './routes/profil.tsx'


const ProtectedRoute = () => {
  const token = localStorage.getItem('user_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />; 
};


const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginRoute />,
  },
  {
    path: '/signin',
    element: <SignInRoute />,
  },
  {
    element: <ProtectedRoute />, 
    children: [
      {
        path: '/feed',
        element: <FeedRoute />,
      },
      {
        path: '/',
        element: <App />,
      },
      {
        path: '/createpost',
        element: <CreatePostRoute />,
      },
      {
        path: '/sidebar',
        element: <SidebarRoute />,
      },
      {
        path: '/profil',
        element: <ProfileRoute />,
      },
    ]
  }
], {basename: import.meta.env.VITE_BASE_PATH });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
