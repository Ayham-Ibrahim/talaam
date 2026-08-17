import { useState } from 'react';
import { Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrencyStore } from '@/store';
import { useT } from '@/hooks/useT';
import { CURRENCIES } from '@/lib/currency';

export function CurrencySwitcher({ className }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const active = useCurrencyStore((s) => s.currency);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        className={className || `hidden sm:flex items-center gap-1 h-11 px-2.5 rounded-full hover:bg-line/50 transition-colors shrink-0 ${
          open ? 'bg-line/50' : ''
        }`}
        aria-label={t('nav.currency')}
      >
        <Coins size={18} className="text-ink-soft" />
        <span className="text-xs font-bold text-ink-soft">{active}</span>
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
              className="absolute left-0 top-full z-20 mt-2 max-h-80 w-56 overflow-y-auto rounded-2xl border border-line bg-white py-2 shadow-lift"
            >
              {CURRENCIES.map((currency) => (
                <button
                  key={currency.code}
                  type="button"
                  onClick={() => {
                    setCurrency(currency.code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-2 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-line/30 ${
                    active === currency.code ? 'text-primary' : 'text-ink'
                  }`}
                >
                  <span className="font-bold">{currency.code}</span>
                  <span className="text-ink-soft">{currency.name}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
