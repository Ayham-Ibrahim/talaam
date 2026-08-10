import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRouter } from "@/routes/AppRouter";
import { LogoIntro } from "@/components/ui/LogoIntro";
import { CursorLight } from "@/motion/ambient/AmbientEngine";
import { useEffect, useState } from "react";
import { useLocaleStore } from "@/store";
import { useAuth } from "@/hooks/useAuth";
import { useSyncTimezone } from "@/hooks/useProfile";
import { getBrowserTimezone } from "@/lib/timezone";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * صامت تماماً (بلا واجهة) — يرسل منطقة متصفح المستخدم الفعلية للباك مرة واحدة
 * عند كل تحميل تطبيق وهو مسجَّل دخوله. الباك يتجاهل النداء بهدوء إن كان قد
 * ثبَّت منطقته يدوياً من الإعدادات (ProfileController::syncTimezone)، فاستدعاؤه
 * دائماً بلا شرط هنا آمن تماماً ولا يطغى على أي اختيار يدوي سابق.
 */
function TimezoneAutoSync() {
  const { isAuthenticated } = useAuth();
  const syncTimezone = useSyncTimezone();
  const syncMutate = syncTimezone.mutate;

  useEffect(() => {
    if (!isAuthenticated) return;
    syncMutate(getBrowserTimezone());
  }, [isAuthenticated, syncMutate]);

  return null;
}

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

  // The whole app tree stays mounted (display: none) behind the intro
  // screen, so every GSAP ScrollTrigger created while it's hidden measures
  // a zero-height layout and ends up with wrong trigger positions — some
  // animations fire late, others (once: true) never fire at all. Once the
  // intro clears and the real layout is visible, force GSAP to recompute
  // every trigger against the actual DOM.
  useEffect(() => {
    if (!introFinished) return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => ScrollTrigger.refresh());
    });

    // Images/fonts that finish loading after that point can still shift
    // element heights and invalidate the trigger positions again.
    const onWindowLoad = () => ScrollTrigger.refresh();
    if (document.readyState === "complete") {
      onWindowLoad();
    } else {
      window.addEventListener("load", onWindowLoad);
    }

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("load", onWindowLoad);
    };
  }, [introFinished]);

  return (
    <QueryClientProvider client={queryClient}>
      <CursorLight />
      {!introFinished && (
        <LogoIntro onComplete={() => setIntroFinished(true)} />
      )}
      <div style={{ display: introFinished ? "block" : "none" }}>
        <TimezoneAutoSync />
        <AppRouter />
      </div>
    </QueryClientProvider>
  );
}
