import { useState } from 'react';
import { Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocaleStore } from '@/store';
import { useT } from '@/hooks/useT';

const LANGUAGES = [
  { code: 'ar', label: 'العربية' },
  { code: 'en', label: 'English' },
];

export function LanguageSwitcher({ className }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const active = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        className={className || `hidden sm:flex w-11 h-11 rounded-full hover:bg-line/50 transition-colors items-center justify-center shrink-0 ${
          open ? 'bg-line/50' : ''
        }`}
        aria-label={t('nav.language')}
      >
        <Globe size={18} className="text-ink-soft" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-full z-20 mt-2 w-36 rounded-2xl border border-line bg-white py-2 shadow-lift"
            >
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLocale(lang.code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-end gap-2 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-line/30 ${
                    active === lang.code ? 'text-primary' : 'text-ink'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
