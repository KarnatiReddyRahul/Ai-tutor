import { useEffect, useState } from 'react';
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
import LearningDashboard from '@/pages/LearningDashboard';
import ModuleViewer from '@/pages/ModuleViewer';
import LearningCoachChat from '@/pages/LearningChat';
import NotFound from '@/pages/NotFound';
import { useAuthStore } from '@/store/authStore';

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  );
}

// Protected Route Component — waits for Zustand persist hydration before
// checking authentication, preventing false redirects on page refresh.
function ProtectedRoute({ element }: { element: React.ReactNode }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated());

  useEffect(() => {
    if (hydrated) return;
    // Subscribe to hydration completion
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    // Fallback: if hydration never fires (e.g. storage error), force-hydrate after 2s
    const timer = setTimeout(() => {
      if (!useAuthStore.persist.hasHydrated()) {
        console.warn('[ProtectedRoute] Hydration timed out — forcing rehydrate');
        useAuthStore.persist.rehydrate();
        setHydrated(true);
      }
    }, 2000);
    return () => {
      unsub();
      clearTimeout(timer);
    };
  }, [hydrated]);

  if (!hydrated) {
    return <LoadingFallback />;
  }

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
      { path: '/learning/:sessionId', element: <ProtectedRoute element={<LearningDashboard />} /> },
      { path: '/learning/:sessionId/module/:moduleId', element: <ProtectedRoute element={<ModuleViewer />} /> },
      { path: '/learning/:sessionId/chat', element: <ProtectedRoute element={<LearningCoachChat />} /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
