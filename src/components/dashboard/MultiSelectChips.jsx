import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';

/**
 * Multi-value picker (curriculum_ids, stage_ids...) — same visual shell as SmoothSelect but toggles many values.
 * `max` mirrors the backend's array-count cap on the same field (e.g. curriculum_ids max:20) — once reached,
 * unselected options become unselectable instead of silently letting the user build a payload the API will reject.
 */
export function MultiSelectChips({ label, values, onChange, options, placeholder, max }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const atMax = typeof max === 'number' && values.length >= max;

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const toggle = (value) => {
    if (!values.includes(value) && atMax) return;
    onChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value]);
  };

  const selectedOptions = options.filter((o) => values.includes(o.value));

  return (
    <div ref={rootRef} className="flex flex-col items-start gap-1.5">
      {label && <label className="text-sm font-semibold text-primary">{label}</label>}
      <div className="relative w-full">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`flex w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 py-3 text-sm transition-colors duration-150 ${
            open ? 'border-primary' : 'border-[#E3E3E3] hover:border-primary/40'
          }`}
        >
          <ChevronDown size={16} className={`shrink-0 text-ink-soft transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          <span className={selectedOptions.length ? 'text-ink' : 'text-[#AEAEB2]'}>
            {selectedOptions.length ? `${selectedOptions.length} مُختارة` : placeholder}
          </span>
        </button>

        {open && (
          <div className="absolute z-20 mt-2 w-full origin-top animate-fade-in overflow-hidden rounded-2xl bg-white p-2 shadow-lift">
            {options.map((opt) => {
              const isSelected = values.includes(opt.value);
              const isDisabled = !isSelected && atMax;
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => toggle(opt.value)}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-right text-sm transition-colors duration-150 ${
                    isSelected
                      ? 'bg-primary/10 font-semibold text-primary'
                      : isDisabled
                        ? 'cursor-not-allowed text-ink-soft/50'
                        : 'text-ink hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  {isSelected && <Check size={15} />}
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {atMax && <span className="text-xs text-ink-soft">{`الحد الأقصى ${max} عنصر`}</span>}

      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map((opt) => (
            <span key={opt.value} className="flex items-center gap-1 rounded-pill bg-primary-light px-3 py-1 text-xs font-medium text-primary">
              {opt.label}
              <button type="button" onClick={() => toggle(opt.value)} aria-label="إزالة">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
