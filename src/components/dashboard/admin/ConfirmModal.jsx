import { X } from 'lucide-react';

/** Generic yes/no confirmation modal — used for destructive actions like deleting a taxonomy item */
export function ConfirmModal({ title, message, confirmLabel, cancelLabel, isPending, danger = true, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label={cancelLabel}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
          >
            <X size={18} />
          </button>
          <h3 className="flex-1 text-center text-lg font-bold text-ink">{title}</h3>
          <span className="w-8" />
        </div>

        {message && <p className="text-center text-sm text-ink-soft">{message}</p>}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-line py-3 text-sm font-medium text-ink-soft hover:bg-line/30"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className={`flex-1 rounded-xl py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 ${
              danger ? 'bg-accent-pink' : 'bg-primary'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
