import { RouterProvider } from 'react-router-dom';
import { Suspense } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { router } from '@/routes';

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

export default function App() {
  return (
    <TooltipProvider>
      <Suspense fallback={<LoadingFallback />}>
        <RouterProvider router={router} />
      </Suspense>
    </TooltipProvider>
  );
}
