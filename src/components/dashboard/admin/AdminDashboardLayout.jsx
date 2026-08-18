import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  ChevronRight,
  FileSpreadsheet,
  GraduationCap,
  Home,
  ListTree,
  LogOut,
  MessageSquareWarning,
  Package,
  Settings,
  Wallet,
  Menu,
  X,
  Globe,
} from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { Avatar } from '@/components/ui';
import { NotificationsBell } from '@/components/notifications/NotificationsBell';
import { useAuth, useLogout } from '@/hooks/useAuth';
import { useAdminOverview } from '@/hooks/useAdmin';
import { useT } from '@/hooks/useT';

/** كل عنصر مرتبط بعدّاد من overview.stats — نقطة حمراء عند > 0. مؤقت ريثما تُستبدَل بإشعارات Firebase لحظية */
const NAV_ITEMS = [
  { key: 'home', icon: Home, path: '/dashboard/admin', end: true },
  { key: 'teachers', icon: GraduationCap, path: '/dashboard/admin/teachers', statKey: 'pendingVerificationsCount' },
  { key: 'packages', icon: Package, path: '/dashboard/admin/listings', statKey: 'pendingApprovalsCount' },
  { key: 'complaints', icon: MessageSquareWarning, path: '/dashboard/admin/complaints', statKey: 'openComplaintsCount' },
  { key: 'taxonomy', icon: ListTree, path: '/dashboard/admin/taxonomy' },
  { key: 'payouts', icon: Wallet, path: '/dashboard/admin/payouts' },
  { key: 'studentImport', icon: FileSpreadsheet, path: '/dashboard/admin/student-import' },
  { key: 'teacherImport', icon: FileSpreadsheet, path: '/dashboard/admin/teacher-import' },
  { key: 'settings', icon: Settings, path: '/dashboard/admin/settings' },
];

export function AdminDashboardLayout({ children }) {
  const t = useT();
  const { user } = useAuth();
  const logout = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { data: overview } = useAdminOverview();

  // Close sidebar on path change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const activeNavItem =
    NAV_ITEMS.find((item) =>
      item.path
        ? item.end
          ? location.pathname === item.path
          : location.pathname.startsWith(item.path)
        : false
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

      <aside className={`shrink-0 border-l border-line/60 bg-white lg:flex lg:w-[287px] lg:flex-col ${
        sidebarOpen ? "fixed inset-y-0 right-0 z-50 flex w-[287px] flex-col" : "hidden"
      }`}>
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
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            if (!item.path) {
              return (
                <div
                  key={item.key}
                  className="flex cursor-not-allowed items-center justify-end gap-3.5 px-8 py-4 text-base font-medium text-[#2D2D2D]/60"
                >
                  {t(`dashboard.adminNav.${item.key}`)}
                  <Icon size={22} />
                </div>
              );
            }
            const pendingCount = item.statKey ? overview?.stats?.[item.statKey] : 0;
            return (
              <NavLink
                key={item.key}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center justify-end gap-3.5 rounded-l-2xl px-8 py-4 text-base font-medium transition-colors ${
                    isActive ? 'bg-primary text-white' : 'text-[#2D2D2D] hover:bg-line/40'
                  }`
                }
              >
                {t(`dashboard.adminNav.${item.key}`)}
                <span className="relative">
                  <Icon size={22} />
                  {!!pendingCount && <span className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full bg-accent-pink" />}
                </span>
              </NavLink>
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
                  <div className="text-xs text-[#777777]">{t('dashboard.roleAdmin')}</div>
                </div>
                <Avatar name={user?.name} src={user?.avatar} size="sm" />
                <ChevronRight size={14} className={`text-[#2D2D2D] transition-transform ${menuOpen ? '-rotate-90' : ''}`} />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute left-0 top-full z-20 mt-2 w-44 rounded-2xl border border-line bg-white py-2 shadow-lift">
                    <button
                      type="button"
                      onClick={() => logout.mutate()}
                      className="flex w-full items-center justify-end gap-2 px-4 py-2.5 text-sm font-medium text-accent-pink hover:bg-line/30"
                    >
                      {t('dashboard.logout')}
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
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-2 rounded-pill border border-line px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-bold text-ink">
              <span className="hidden sm:inline">{t(`dashboard.adminNav.${activeNavItem.key}`)}</span>
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
