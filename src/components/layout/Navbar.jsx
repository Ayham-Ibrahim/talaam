import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Bell, Heart, Menu, X } from 'lucide-react';
import { Logo } from './Logo';
import { Button } from '@/components/ui';
import { useT } from '@/hooks/useT';

export function Navbar() {
  const t = useT();
  const [open, setOpen] = useState(false);

  const links = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/search', label: t('nav.search') },
    { to: '/how-it-works', label: t('nav.howItWorks') },
    { to: '/resources', label: t('nav.resources') },
    { to: '/about', label: t('nav.about') },
    { to: '/contact', label: t('nav.contact') },
  ];

  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur border-b border-line">
      <div className="container-app flex items-center justify-between h-16">
        {/* Right (RTL start): logo + mobile toggle */}
        <div className="flex items-center gap-3">
          <Logo />
          <button
            className="lg:hidden w-9 h-9 flex items-center justify-center"
            onClick={() => setOpen((v) => !v)}
            aria-label="القائمة"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Center: nav links */}
        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-ink-soft hover:text-ink'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Left (RTL end): login + icons */}
        <div className="flex items-center gap-3">
          <Button size="sm">{t('nav.login')}</Button>
          <button className="w-9 h-9 rounded-full hover:bg-line/50 flex items-center justify-center" aria-label="الإشعارات">
            <Bell size={18} className="text-ink-soft" />
          </button>
          <button className="w-9 h-9 rounded-full hover:bg-line/50 flex items-center justify-center" aria-label="المفضلة">
            <Heart size={18} className="text-ink-soft" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="lg:hidden border-t border-line bg-surface px-6 py-4 flex flex-col gap-3">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `text-sm font-medium py-1 ${isActive ? 'text-primary' : 'text-ink-soft'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
