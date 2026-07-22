import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Bell, Calendar, ChevronLeft, CreditCard, FileText, Heart, Home, LogOut, Settings, Star } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { Avatar } from '@/components/ui';
import { useAuth, useLogout } from '@/hooks/useAuth';
import { useFavoritesStore } from '@/store';
import { useT } from '@/hooks/useT';

const NAV_ITEMS = [
  { key: 'home', icon: Home, path: '/dashboard/student', end: true },
  { key: 'calendar', icon: Calendar, path: '/dashboard/student/calendar' },
  { key: 'sessions', icon: FileText },
  { key: 'packages', icon: CreditCard, path: '/dashboard/student/packages' },
  { key: 'invoices', icon: FileText },
  { key: 'reviews', icon: Star },
  { key: 'settings', icon: Settings },
];

export function DashboardLayout({ children }) {
  const t = useT();
  const { user } = useAuth();
  const logout = useLogout();
  const favoritesCount = useFavoritesStore((s) => s.favorites.size);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FCFCFC] lg:flex">
      {/* Sidebar — only "الرئيسية" is a real route for now; the rest are placeholders for future phases */}
      <aside className="hidden shrink-0 border-l border-line/60 bg-white lg:flex lg:w-[287px] lg:flex-col">
        <div className="flex items-center justify-center border-b border-line/60 px-6 py-6">
          <Logo />
        </div>
        <nav className="flex flex-1 flex-col gap-1 py-4">
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
                  `flex items-center justify-end gap-3.5 rounded-r-2xl px-8 py-4 text-base font-medium transition-colors ${
                    isActive ? 'bg-primary text-white' : 'text-[#2D2D2D] hover:bg-line/40'
                  }`
                }
              >
                {t(`dashboard.nav.${item.key}`)}
                <Icon size={22} />
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between gap-4 border-b border-line/60 bg-white px-6 py-3 lg:px-10">
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
                    {t(user?.role === 'teacher' ? 'dashboard.roleTeacher' : 'dashboard.roleStudent')}
                  </div>
                </div>
                <Avatar name={user?.name} src={user?.avatar} size="sm" />
                <ChevronLeft size={14} className={`text-[#2D2D2D] transition-transform ${menuOpen ? '-rotate-90' : ''}`} />
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

            <button
              type="button"
              className="hidden h-10 w-10 items-center justify-center rounded-full hover:bg-line/40 sm:flex"
              aria-label="الاشعارات"
            >
              <Bell size={18} className="text-[#2D2D2D]" />
            </button>
            <NavLink
              to="/favorites"
              className="relative hidden h-10 w-10 items-center justify-center rounded-full hover:bg-line/40 sm:flex"
              aria-label="المفضلة"
            >
              <Heart size={18} className="text-[#2D2D2D]" />
              {favoritesCount > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-pink" />}
            </NavLink>
          </div>

          <NavLink
            to="/"
            className="flex items-center gap-2 rounded-pill border border-line px-4 py-2 text-sm font-bold text-ink hover:bg-line/30"
          >
            {t('dashboard.nav.home')}
            <Home size={16} className="text-primary" />
          </NavLink>

          <div className="hidden sm:block">
            <Logo />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
