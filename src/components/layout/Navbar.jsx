import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Bell, Heart, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';
import { Button } from '@/components/ui';
import { useFavoritesStore } from '@/store';
import { useT } from '@/hooks/useT';

export function Navbar() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const favoritesCount = useFavoritesStore((s) => s.favorites.size);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/search', label: t('nav.search') },
    { to: '/how-it-works', label: t('nav.howItWorks') },
    { to: '/about', label: t('nav.about') },
    { to: '/contact', label: t('nav.contact') },
  ];

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-surface/80 backdrop-blur-md shadow-sm border-b border-line/50 py-0' : 'bg-transparent py-2 border-transparent'
      }`}
    >
      <div className="container-app flex items-center justify-between h-16">
        {/* Right (RTL start): logo + mobile toggle */}
        <div className="flex items-center gap-1 sm:gap-3">
          <Logo />
          <button
            className="lg:hidden w-11 h-11 flex items-center justify-center shrink-0 disabled:opacity-50"
            onClick={() => setOpen((v) => !v)}
            aria-label="القائمة"
          >
            <motion.div initial={false} animate={{ rotate: open ? 90 : 0 }}>
              {open ? <X size={22} /> : <Menu size={22} />}
            </motion.div>
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
                `text-sm font-medium transition-all ${
                  isActive ? 'text-primary' : 'text-ink-soft hover:text-ink hover:scale-105 inline-block'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Left (RTL end): login + icons */}
        <div className="flex items-center gap-1 sm:gap-3">
          <Button size="sm" className="sm:!px-5">{t('nav.login')}</Button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden sm:flex w-11 h-11 rounded-full hover:bg-line/50 items-center justify-center shrink-0"
            aria-label="الإشعارات"
          >
            <Bell size={18} className="text-ink-soft" />
          </motion.button>
          <NavLink
            to="/favorites"
            className={({ isActive }) =>
              `hidden sm:flex relative w-11 h-11 rounded-full hover:bg-line/50 transition-colors items-center justify-center shrink-0 ${
                isActive ? 'bg-line/50' : ''
              }`
            }
            aria-label="المفضلة"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Heart size={18} className="text-ink-soft" />
            </motion.div>
            {favoritesCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-pink" 
              />
            )}
          </NavLink>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.nav 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden border-t border-line/50 bg-surface/95 backdrop-blur overflow-hidden px-6 py-4 flex flex-col gap-3"
          >
            {links.map((l, i) => (
              <motion.div
                key={l.to}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <NavLink
                  to={l.to}
                  end={l.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block text-sm font-medium py-1 w-full ${isActive ? 'text-primary' : 'text-ink-soft'}`
                  }
                >
                  {l.label}
                </NavLink>
              </motion.div>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
