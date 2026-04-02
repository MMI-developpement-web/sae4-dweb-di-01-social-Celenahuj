import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Outlet, RouterProvider, Navigate } from 'react-router-dom'
import { motion } from "framer-motion"
import './index.css'

// --- 1. Import de tes deux nouveaux Stores ---
import { AuthProvider } from './contexts/AuthContext'
import { PostProvider } from './contexts/PostContext'

import App from './App.tsx'
import LoginRoute from './routes/login.tsx'
import SignInRoute from './routes/signin.tsx'
import FeedRoute from './routes/feed.tsx'
import CreatePostRoute from './components/CreatePost.tsx'
import SidebarRoute from './routes/sidebar.tsx'
import ProfileRoute from './routes/profil.tsx'
import EditProfileRoute from './routes/editProfile.tsx'
import CommentRoute from './routes/comment.tsx';
import BlockedRoute from './routes/blocked.tsx';
import PrivacySettings from './components/PrivacySetting.tsx';

import { useAuth } from './contexts/AuthContext';

const ProtectedRoute = () => {
  const { token } = useAuth();
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
      {
        path: '/profil/:id',
        element: <ProfileRoute />,
      },
      {
        path: '/editProfile',
        element: <EditProfileRoute />,
      },
      {
        path: '/comment',
        element: <CommentRoute />,
      },
      {
        path: '/blocked',
        element: <BlockedRoute />,
      },
      {
        path: '/privacy',
        element: <PrivacySettings />,
      }
    ]
  }
], {basename: import.meta.env.VITE_BASE_PATH });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* --- 2. On englobe l'application par nos Providers --- */}
    <AuthProvider>
      <PostProvider>
        <RouterProvider router={router} />
      </PostProvider>
    </AuthProvider>
  </StrictMode>,
)