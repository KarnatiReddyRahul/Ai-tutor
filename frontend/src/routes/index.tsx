import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import TopicSelection from '@/pages/TopicSelection';
import Interview from '@/pages/Interview';
import LearnChat from '@/pages/LearnChat';
import Results from '@/pages/Results';
import KnowledgeGaps from '@/pages/KnowledgeGaps';
import Roadmap from '@/pages/Roadmap';
import History from '@/pages/History';
import Settings from '@/pages/Settings';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';
import { useAuthStore } from '@/store/authStore';

// Protected Route Component
function ProtectedRoute({ element }: { element: React.ReactNode }) {
  const { isLoggedIn } = useAuthStore();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return element;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/topics', element: <ProtectedRoute element={<TopicSelection />} /> },
      { path: '/learn/:topicId', element: <ProtectedRoute element={<LearnChat />} /> },
      { path: '/interview/:topicId', element: <ProtectedRoute element={<Interview />} /> },
      { path: '/results', element: <ProtectedRoute element={<Results />} /> },
      { path: '/knowledge-gaps', element: <ProtectedRoute element={<KnowledgeGaps />} /> },
      { path: '/roadmap', element: <ProtectedRoute element={<Roadmap />} /> },
      { path: '/history', element: <ProtectedRoute element={<History />} /> },
      { path: '/settings', element: <ProtectedRoute element={<Settings />} /> },
      { path: '/profile', element: <ProtectedRoute element={<Profile />} /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
