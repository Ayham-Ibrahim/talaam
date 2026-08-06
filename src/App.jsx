import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRouter } from "@/routes/AppRouter";
import { LogoIntro } from "@/components/ui/LogoIntro";
import { CursorLight } from "@/motion/ambient/AmbientEngine";
import { useEffect, useState } from "react";
import { useLocaleStore } from "@/store";

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
  const locale = useLocaleStore((s) => s.locale);

  // Dashboard pages hardcode their own dir="rtl" wrapper, so this only
  // affects the public website's reading direction.
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "en" ? "ltr" : "rtl";
  }, [locale]);

  return (
    <QueryClientProvider client={queryClient}>
      <CursorLight />
      {!introFinished && (
        <LogoIntro onComplete={() => setIntroFinished(true)} />
      )}
      <div style={{ display: introFinished ? "block" : "none" }}>
        <AppRouter />
      </div>
    </QueryClientProvider>
  );
}
