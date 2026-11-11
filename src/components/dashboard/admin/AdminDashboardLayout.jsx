import { useState, useEffect, createContext, useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Banknote,
  BarChart3,
  Briefcase,
  PieChart,
  CalendarDays,
  ChevronRight,
  ChevronDown,
  FileSpreadsheet,
  GraduationCap,
  HandCoins,
  HandHeart,
  History,
  Home,
  ListTree,
  LogOut,
  Mail,
  MessageSquareWarning,
  Package,
  ShieldCheck,
  Settings,
  Users,
  Wallet,
  Menu,
  X,
  Globe,
  LineChart,
  Receipt,
  UserCog,
  ChevronLeft,
  Star,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Avatar } from "@/components/ui";
import { NotificationsBell } from "@/components/notifications/NotificationsBell";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { useAdminOverview } from "@/hooks/useAdmin";
import { useT } from "@/hooks/useT";
/**
 * عناصر القائمة مجمَّعة حسب الوظيفة — عنوان كل مجموعة من dashboard.adminNavGroups (group: null بلا عنوان).
 * كل عنصر مرتبط بعدّاد من overview.stats — نقطة حمراء عند > 0. مؤقت ريثما تُستبدَل بإشعارات Firebase لحظية
 */
const ADMIN_NAV_GROUPS = [
  {
    group: null,
    items: [{ key: "home", icon: Home, path: "/dashboard/admin", end: true }],
  },
  {
    group: "users",
    items: [
      {
        key: "teachers",
        icon: GraduationCap,
        path: "/dashboard/admin/teachers",
        statKey: "pendingVerificationsCount",
      },
      {
        key: "academicSupporters",
        icon: HandHeart,
        path: "/dashboard/admin/academic-supporters",
      },
      { key: "students", icon: Users, path: "/dashboard/admin/students" },
      {
        key: "accountants",
        icon: UserCog,
        path: "/dashboard/admin/accountants",
      },
    ],
  },
  {
    group: "teaching",
    items: [
      {
        key: "sessions",
        icon: CalendarDays,
        path: "/dashboard/admin/sessions",
      },
      {
        key: "packages",
        icon: Package,
        path: "/dashboard/admin/listings",
        statKey: "pendingApprovalsCount",
      },
      {
        key: "sessionQuality",
        icon: Star,
        path: "/dashboard/admin/session-quality",
      },
      { key: "taxonomy", icon: ListTree, path: "/dashboard/admin/taxonomy" },
    ],
  },
  {
    group: "finance",
    items: [
      { key: "payouts", icon: Wallet, path: "/dashboard/admin/payouts" },
      { key: "bookings", icon: Receipt, path: "/dashboard/admin/bookings" },
      {
        key: "teacherSessionsReport",
        icon: BarChart3,
        path: "/dashboard/admin/teacher-sessions-report",
      },
      {
        key: "academicSupportFinance",
        icon: HandCoins,
        path: "/dashboard/admin/academic-support-finance",
      },
      // قائمة فرعية منسدلة داخل المالية — children تُعرض تحت العنصر عند فتحه
      {
        key: "hr",
        icon: Briefcase,
        children: [
          { key: "employees", icon: Briefcase, path: "/dashboard/admin/employees" },
          { key: "payroll", icon: Banknote, path: "/dashboard/admin/payroll" },
          {
            key: "payrollReport",
            icon: PieChart,
            path: "/dashboard/admin/payroll-report",
          },
        ],
      },
    ],
  },
  {
    group: "reports",
    items: [
      {
        key: "studentsReport",
        icon: LineChart,
        path: "/dashboard/admin/students-report",
      },
    ],
  },
  {
    group: "support",
    items: [
      {
        key: "complaints",
        icon: MessageSquareWarning,
        path: "/dashboard/admin/complaints",
        statKey: "openComplaintsCount",
      },
      {
        key: "notificationLogs",
        icon: Mail,
        path: "/dashboard/admin/notification-logs",
      },
    ],
  },
  {
    group: "import",
    items: [
      {
        key: "studentImport",
        icon: FileSpreadsheet,
        path: "/dashboard/admin/student-import",
      },
      {
        key: "teacherImport",
        icon: FileSpreadsheet,
        path: "/dashboard/admin/teacher-import",
      },
      {
        key: "importBatches",
        icon: History,
        path: "/dashboard/admin/import-batches",
      },
    ],
  },
  {
    group: "system",
    items: [
      {
        key: "legalPages",
        icon: ShieldCheck,
        path: "/dashboard/admin/legal-pages",
      },
      { key: "settings", icon: Settings, path: "/dashboard/admin/settings" },
    ],
  },
];

/** لوحة المحاسب: نسخة مالية فقط من لوحة الأدمن — نفس الهيكل، بعناصر مالية فقط (مجموعة واحدة بلا عنوان) */
const ACCOUNTANT_NAV_GROUPS = [
  {
    group: null,
    items: [
      {
        key: "payouts",
        icon: Wallet,
        path: "/dashboard/accountant/payouts",
        end: false,
      },
      {
        key: "bookings",
        icon: Receipt,
        path: "/dashboard/accountant/bookings",
      },
      {
        key: "teacherSessionsReport",
        icon: BarChart3,
        path: "/dashboard/accountant/teacher-sessions-report",
      },
      {
        key: "academicSupportFinance",
        icon: HandCoins,
        path: "/dashboard/accountant/academic-support-finance",
      },
      {
        key: "hr",
        icon: Briefcase,
        children: [
          {
            key: "employees",
            icon: Briefcase,
            path: "/dashboard/accountant/employees",
          },
          {
            key: "payroll",
            icon: Banknote,
            path: "/dashboard/accountant/payroll",
          },
          {
            key: "payrollReport",
            icon: PieChart,
            path: "/dashboard/accountant/payroll-report",
          },
        ],
      },
    ],
  },
];
const LayoutContext = createContext(false);
export function AdminDashboardLayout({ children, variant = "admin" }) {
  const isAlreadyNested = useContext(LayoutContext);
  if (isAlreadyNested) {
    return <>{children}</>;
  }

  const t = useT();
  const { user } = useAuth();
  const logout = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 1. Load initial state from sessionStorage so it survives component unmounts/remounts
  const [collapsedGroups, setCollapsedGroups] = useState(() => {
    const defaults = {
      users: true,
      teaching: true,
      finance: true,
      hr: true,
      reports: true,
      support: true,
      import: true,
      system: true,
    };
    try {
      const saved = sessionStorage.getItem(
        `admin_sidebar_collapsed_${variant}`,
      );
      // دمج مع الافتراضي — مجموعة جديدة غير محفوظة في الجلسة تبدأ مغلقة
      if (saved) return { ...defaults, ...JSON.parse(saved) };
    } catch (e) {}
    return defaults;
  });

  const toggleGroup = (group) => {
    setCollapsedGroups((prev) => {
      const nextState = {
        ...prev,
        [group]: !prev[group],
      };
      // 2. Save state immediately to sessionStorage on every toggle
      try {
        sessionStorage.setItem(
          `admin_sidebar_collapsed_${variant}`,
          JSON.stringify(nextState),
        );
      } catch (e) {}
      return nextState;
    });
  };

  const location = useLocation();
  const isAccountant = variant === "accountant";
  const { data: overview } = useAdminOverview({ enabled: !isAccountant });
  const NAV_GROUPS = isAccountant ? ACCOUNTANT_NAV_GROUPS : ADMIN_NAV_GROUPS;
  // العناصر القابلة للتنقل فقط (قائمة فرعية ← أبناؤها) — لتحديد عنوان الصفحة النشطة
  const NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items).flatMap((item) => item.children ?? [item]);
  const isItemActive = (item) =>
    item.children
      ? item.children.some(isItemActive)
      : item.end
        ? location.pathname === item.path
        : location.pathname.startsWith(item.path);

  // 2. ONLY close the mobile sidebar on route change.
  // We completely removed any automatic code that changes `collapsedGroups`.
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const activeNavItem =
    NAV_ITEMS.find((item) =>
      item.path
        ? item.end
          ? location.pathname === item.path
          : location.pathname.startsWith(item.path)
        : false,
    ) ?? NAV_ITEMS[0];
  const ActivePageIcon = activeNavItem.icon;
  const GROUP_ICONS = {
    users: Users,
    teaching: CalendarDays,
    finance: Wallet,
    reports: LineChart,
    support: MessageSquareWarning,
    import: FileSpreadsheet,
    system: Settings,
  };
  return (
    <LayoutContext.Provider value={true}>
      <div dir="rtl" className="min-h-screen bg-[#FCFCFC] lg:flex relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`shrink-0 border-l border-line/60 bg-white lg:flex lg:w-[287px] lg:flex-col ${
            sidebarOpen
              ? "fixed inset-y-0 right-0 z-50 flex w-[287px] flex-col"
              : "hidden"
          }`}
        >
          <div className="flex flex-col flex-1 h-full overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line/60 px-6 py-6">
              <Logo />
              {/* Close button for mobile */}
              <button
                className="lg:hidden text-[#2D2D2D]"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            <nav dir="ltr" className="flex flex-1 w-full flex-col gap-1 py-4">
              {NAV_GROUPS.map(({ group, items }) => {
                const isCollapsed = group ? !!collapsedGroups[group] : false;

                const isGroupActive = group ? items.some(isItemActive) : false;

                const GroupIcon = group ? GROUP_ICONS[group] : null;

                return (
                  <div key={group ?? "main"} className="flex flex-col gap-1">
                    {/* Main Section Heading */}
                    {group && (
                      <button
                        type="button"
                        onClick={() => toggleGroup(group)}
                        aria-expanded={!isCollapsed}
                        className={`
              mt-3 flex w-full items-center justify-between
              rounded-xl px-8 py-3
              text-base font-medium
              transition-all duration-200
              ${
                isGroupActive
                  ? "bg-primary/10 text-primary"
                  : "text-[#2D2D2D] hover:bg-line/40"
              }
            `}
                      >
                        {/* Collapse Arrow */}
                        <ChevronLeft
                          size={18}
                          className={`
    shrink-0 transition-transform duration-300
    ${!isCollapsed ? "rotate-90" : "rotate-0"}
    ${isGroupActive ? "text-primary" : "text-[#777777]"}
  `}
                        />

                        {/* Label and Icon */}
                        <span className="flex items-center gap-3">
                          <span>{t(`dashboard.adminNavGroups.${group}`)}</span>

                          <GroupIcon
                            size={20}
                            className={`
                  shrink-0 transition-colors duration-200
                  ${isGroupActive ? "text-primary" : "text-[#555555]"}
                `}
                          />
                        </span>
                      </button>
                    )}

                    {/* Child Items */}

                    {/* Children */}
                    <div
                      className={`
    grid transition-all duration-300 ease-in-out
    ${isCollapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"}
  `}
                    >
                      <div className="min-h-0 overflow-hidden">
                        {/* Continuous vertical guide line */}
                        <div
                          className="
      relative mr-8
      border-r border-[#E5E5E5]
      pr-4
    "
                        >
                          {items.map((item) => {
                            const Icon = item.icon;

                            // قائمة فرعية منسدلة: نفس آلية طيّ المجموعات (collapsedGroups بمفتاح العنصر)
                            if (item.children) {
                              const isSubOpen = !collapsedGroups[item.key];
                              const isSubActive = isItemActive(item);

                              return (
                                <div key={item.key} className="flex flex-col">
                                  <button
                                    type="button"
                                    onClick={() => toggleGroup(item.key)}
                                    aria-expanded={isSubOpen}
                                    className={`flex w-full items-center justify-between rounded-xl py-3 pl-5 pr-5 text-base font-medium transition-all duration-200 ${
                                      isSubActive ? "text-primary" : "text-[#2D2D2D]"
                                    } hover:bg-line/40`}
                                  >
                                    <ChevronLeft
                                      size={16}
                                      className={`shrink-0 transition-transform duration-300 ${
                                        isSubOpen ? "rotate-90" : "rotate-0"
                                      } ${isSubActive ? "text-primary" : "text-[#777777]"}`}
                                    />
                                    <span className="flex items-center gap-2">
                                      {t(`dashboard.adminNav.${item.key}`)}
                                      <Icon
                                        size={20}
                                        className={isSubActive ? "text-primary" : "text-[#444444]"}
                                      />
                                    </span>
                                  </button>

                                  <div
                                    className={`grid transition-all duration-300 ease-in-out ${
                                      isSubOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                    }`}
                                  >
                                    <div className="min-h-0 overflow-hidden">
                                      <div className="mr-6 border-r border-[#E5E5E5] pr-3">
                                        {item.children.map((child) => {
                                          const ChildIcon = child.icon;
                                          return (
                                            <NavLink
                                              key={child.key}
                                              to={child.path}
                                              end={child.end}
                                              className={({ isActive }) =>
                                                `relative flex items-center justify-end gap-2 rounded-xl py-2.5 pl-5 pr-4 text-sm transition-all duration-200 ${
                                                  isActive
                                                    ? "bg-[#F3F4F6] text-[#2D2D2D]"
                                                    : "font-medium text-[#2D2D2D] hover:bg-line/40"
                                                }`
                                              }
                                            >
                                              {({ isActive }) => (
                                                <>
                                                  {isActive && (
                                                    <span className="absolute right-[-14px] top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-full bg-primary" />
                                                  )}
                                                  {t(`dashboard.adminNav.${child.key}`)}
                                                  <ChildIcon
                                                    size={18}
                                                    className={isActive ? "text-primary" : "text-[#444444]"}
                                                  />
                                                </>
                                              )}
                                            </NavLink>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            }

                            const pendingCount = item.statKey
                              ? overview?.stats?.[item.statKey]
                              : 0;

                            return (
                              <NavLink
                                key={item.key}
                                to={item.path}
                                end={item.end}
                                className={({ isActive }) => `
              relative flex items-center justify-end
              gap-2 rounded-xl
              py-3 pl-5 pr-5
              text-base
              transition-all duration-200

              ${
                isActive
                  ? "bg-[#F3F4F6] text-[#2D2D2D]"
                  : "font-medium text-[#2D2D2D] hover:bg-line/40"
              }
            `}
                              >
                                {({ isActive }) => (
                                  <>
                                    {/* Active segment of the continuous vertical line */}
                                    {isActive && (
                                      <span
                                        className="
                    absolute right-[-17px]
                    top-1/2
                    h-8 w-[3px]
                    -translate-y-1/2
                    rounded-full
                    bg-primary
                  "
                                      />
                                    )}

                                    {t(`dashboard.adminNav.${item.key}`)}

                                    <span className="relative shrink-0">
                                      <Icon
                                        size={20}
                                        className={
                                          isActive
                                            ? "text-primary"
                                            : "text-[#444444]"
                                        }
                                      />

                                      {!!pendingCount && (
                                        <span
                                          className="
                      absolute -left-1 -top-1 text-md
                      h-2.5 w-2.5 rounded-full
                      bg-accent-pink
                    "
                                        />
                                      )}
                                    </span>
                                  </>
                                )}
                              </NavLink>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>
        </aside>

        <div className="flex flex-1 flex-col overflow-hidden">
          <header
            dir="ltr"
            className="flex items-center justify-between gap-4 border-b border-line/60 bg-white px-4 py-3 lg:px-10"
          >
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
                        isAccountant
                          ? "dashboard.roleAccountant"
                          : "dashboard.roleAdmin",
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
                className="hidden sm:flex items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-[#2D2D2D] hover:bg-line/40 transition-colors"
                aria-label="العودة للموقع"
              >
                العودة للمنصة
              </NavLink>
              <NotificationsBell
                buttonClassName="relative hidden h-10 w-10 items-center justify-center rounded-full hover:bg-line/40 sm:flex"
                iconClassName="text-[#2D2D2D]"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-2 rounded-pill border border-line px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-bold text-ink">
                <span className="hidden sm:inline">
                  {t(`dashboard.adminNav.${activeNavItem.key}`)}
                </span>
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

          <main
            dir="rtl"
            className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-10 lg:py-8"
          >
            {children}
          </main>
        </div>
      </div>
    </LayoutContext.Provider>
  );
}
