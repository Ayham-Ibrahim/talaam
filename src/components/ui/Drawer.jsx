import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Generic slide-in side panel — closes via the X button or a backdrop click.
 * Slides in from the left edge of the screen regardless of page direction, so
 * it reads as a distinct "action panel" layered over the RTL content.
 */
export function Drawer({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/40"
            aria-hidden="true"
          />
          <motion.div
            key="panel"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            className="fixed inset-y-0 left-0 z-[61] flex w-full max-w-md flex-col bg-canvas shadow-2xl"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-line bg-white px-5 py-4">
              <h2 className="text-base font-bold text-ink">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="إغلاق"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-line/50 hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
