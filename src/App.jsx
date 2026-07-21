import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from '@/routes/AppRouter';
import { LogoIntro } from '@/components/ui/LogoIntro';
import { CursorLight } from '@/motion/ambient/AmbientEngine';
import { useState } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
    },
  },
});

export default function App() {
  const [introFinished, setIntroFinished] = useState(() => {
    return !!sessionStorage.getItem("hasSeenIntro");
  });

  return (
    <QueryClientProvider client={queryClient}>
      <CursorLight />
      {!introFinished && <LogoIntro onComplete={() => setIntroFinished(true)} />}
      <div style={{ display: introFinished ? 'block' : 'none' }}>
        <AppRouter />
      </div>
    </QueryClientProvider>
  );
}
