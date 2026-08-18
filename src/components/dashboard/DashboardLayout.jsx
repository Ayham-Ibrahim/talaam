import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Calendar,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  Heart,
  Home,
  LogOut,
  Settings,
  Star,
  UserRound,
  Menu,
  X,
  Globe,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Avatar } from "@/components/ui";
import { NotificationsBell } from "@/components/notifications/NotificationsBell";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { useT } from "@/hooks/useT";
import { LocaleOverrideContext } from "@/context/LocaleOverrideContext";

const STUDENT_NAV_ITEMS = [
  { key: "home", icon: Home, path: "/dashboard/student", end: true },
  { key: "calendar", icon: Calendar, path: "/dashboard/student/calendar" },
  { key: "sessions", icon: FileText, path: "/dashboard/student/sessions" },
  { key: "packages", icon: CreditCard, path: "/dashboard/student/packages" },
  { key: "invoices", icon: FileText, path: "/dashboard/student/invoices" },
  { key: "reviews", icon: Star, path: "/dashboard/student/reviews" },
  { key: "settings", icon: Settings, path: "/dashboard/student/settings" },
];

const TEACHER_NAV_ITEMS = [
  { key: "home", icon: Home, path: "/dashboard/teacher", end: true },
  { key: "calendar", icon: Calendar, path: "/dashboard/teacher/calendar" },
  { key: "packages", icon: CreditCard, path: "/dashboard/teacher/packages" },
  {
    key: "bookingRequests",
    icon: CalendarClock,
    path: "/dashboard/teacher/booking-requests",
  },
  { key: "sessions", icon: FileText, path: "/dashboard/teacher/sessions" },
  { key: "students", icon: UserRound, path: "/dashboard/teacher/students" },
  { key: "settings", icon: Settings, path: "/dashboard/teacher/settings" },
];

export function DashboardLayout({ children }) {
  return (
    <LocaleOverrideContext.Provider value="ar">
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </LocaleOverrideContext.Provider>
  );
}

function DashboardLayoutInner({ children }) {
  const t = useT();
  const { user } = useAuth();
  const logout = useLogout();
  const { data: favorites } = useFavorites();
  const favoritesCount = favorites?.length ?? 0;
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on path change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const NAV_ITEMS =
    user?.role === "teacher" ? TEACHER_NAV_ITEMS : STUDENT_NAV_ITEMS;

  const activeNavItem =
    NAV_ITEMS.find((item) =>
      item.path
        ? item.end
          ? location.pathname === item.path
          : location.pathname.startsWith(item.path)
        : false,
    ) ?? NAV_ITEMS[0];
  const ActivePageIcon = activeNavItem.icon;

  return (
    <div dir="rtl" className="min-h-screen bg-[#FCFCFC] lg:flex relative">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`shrink-0 border-l border-line/60 bg-white lg:flex lg:w-[287px] lg:flex-col ${
        sidebarOpen ? "fixed inset-y-0 right-0 z-50 flex w-[287px] flex-col" : "hidden"
      }`}>
        <div className="flex flex-col flex-1 h-full overflow-y-auto">
          <div className="flex items-center justify-between border-b border-line/60 px-6 py-6">
            <NavLink to="/" aria-label="الصفحة الرئيسية">
              <Logo />
            </NavLink>
            {/* Close button for mobile */}
            <button 
              className="lg:hidden text-[#2D2D2D]" 
              onClick={() => setSidebarOpen(false)}
            >
              <X size={24} />
            </button>
          </div>
          <nav dir="ltr" className="flex flex-1 w-full flex-col gap-1 py-4">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              if (!item.path) {
                return (
                  <div
                    key={item.key}
                    className="flex cursor-not-allowed items-center justify-end gap-3.5 px-8 py-4 text-base font-medium text-[#2D2D2D]/60"
                  >
                    {t(`dashboard.nav.${item.key}`)}
                    <Icon size={22} />
                  </div>
                );
              }
              return (
                <NavLink
                  key={item.key}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center justify-end gap-3.5 rounded-l-2xl px-8 py-4 text-base font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-white"
                        : "text-[#2D2D2D] hover:bg-line/40"
                    }`
                  }
                >
                  {t(`dashboard.nav.${item.key}`)}
                  <Icon size={22} />
                </NavLink>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar — natural document RTL: first child renders right, last renders left */}
        <header
          dir="ltr"
          className="flex items-center justify-between gap-4 border-b border-line/60 bg-white px-4 py-3 lg:px-10"
        >
          {/* Right: user menu + bell + favorites */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-pill py-1 pl-1 pr-2 hover:bg-line/40"
              >
                <div className="text-right">
                  <div className="text-sm text-[#2D2D2D]">{user?.name}</div>
                  <div className="text-xs text-[#777777]">
                    {t(
                      user?.teacherType === "training_center"
                        ? "dashboard.roleCenter"
                        : user?.role === "teacher"
                          ? "dashboard.roleTeacher"
                          : "dashboard.roleStudent",
                    )}
                  </div>
                </div>
                <Avatar name={user?.name} src={user?.avatar} size="sm" />
                <ChevronRight
                  size={14}
                  className={`text-[#2D2D2D] transition-transform ${menuOpen ? "-rotate-90" : ""}`}
                />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute left-0 top-full z-20 mt-2 w-44 rounded-2xl border border-line bg-white py-2 shadow-lift">
                    <button
                      type="button"
                      onClick={() => logout.mutate()}
                      className="flex w-full items-center justify-end gap-2 px-4 py-2.5 text-sm font-medium text-accent-pink hover:bg-line/30"
                    >
                      {t("dashboard.logout")}
                      <LogOut size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>

            <NavLink
              to="/"
              className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-line/40 transition-colors"
              aria-label="العودة للموقع"
              title="العودة للموقع"
            >
              <Globe size={18} className="text-[#2D2D2D]" />
            </NavLink>
            <NotificationsBell
              buttonClassName="relative hidden h-10 w-10 items-center justify-center rounded-full hover:bg-line/40 sm:flex"
              iconClassName="text-[#2D2D2D]"
            />
            <NavLink
              to="/favorites"
              className="relative hidden h-10 w-10 items-center justify-center rounded-full hover:bg-line/40 sm:flex"
              aria-label="المفضلة"
            >
              <Heart size={18} className="text-[#2D2D2D]" />
              {favoritesCount > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-pink" />
              )}
            </NavLink>
          </div>

          {/* Left: current page indicator and mobile menu toggle */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-2 rounded-pill border border-line px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-bold text-ink">
              <span className="hidden sm:inline">{t(`dashboard.nav.${activeNavItem.key}`)}</span>
              <ActivePageIcon size={16} className="text-primary" />
            </span>
            <button
              className="lg:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-pill border border-line bg-white text-[#2D2D2D]"
              onClick={() => setSidebarOpen(true)}
              aria-label="القائمة"
            >
              <Menu size={20} />
            </button>
          </div>
        </header>

        <main dir="rtl" className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
