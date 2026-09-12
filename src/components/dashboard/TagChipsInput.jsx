import { useState } from 'react';
import { Plus, X } from 'lucide-react';

/**
 * Free-text multi-value input for backend `string[]` fields (teaching_methods,
 * exam_prep, age_groups). Type + Enter (or the + button) to add a chip; the
 * `suggestions` render as one-tap quick-adds. Values are plain strings.
 */
export function TagChipsInput({ label, values = [], onChange, suggestions = [], placeholder, max = 20, maxLength = 50 }) {
  const [draft, setDraft] = useState('');
  const atMax = values.length >= max;

  const add = (raw) => {
    const value = raw.trim().slice(0, maxLength);
    if (!value || atMax || values.some((v) => v.toLowerCase() === value.toLowerCase())) return;
    onChange([...values, value]);
    setDraft('');
  };

  const remove = (value) => onChange(values.filter((v) => v !== value));

  const openSuggestions = suggestions.filter((s) => !values.some((v) => v.toLowerCase() === s.toLowerCase()));

  return (
    <div className="flex flex-col items-start gap-1.5">
      {label && <label className="text-sm font-semibold text-primary">{label}</label>}

      <div className="flex w-full gap-2">
        <input
          type="text"
          value={draft}
          maxLength={maxLength}
          disabled={atMax}
          placeholder={atMax ? `الحد الأقصى ${max} عناصر` : placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add(draft);
            }
          }}
          className="w-full rounded-lg border border-[#E3E3E3] bg-white px-3 py-3 text-sm text-ink focus:border-primary focus:outline-none disabled:bg-canvas"
        />
        <button
          type="button"
          onClick={() => add(draft)}
          disabled={!draft.trim() || atMax}
          aria-label="إضافة"
          className="shrink-0 rounded-lg bg-primary px-3 text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <Plus size={16} />
        </button>
      </div>

      {openSuggestions.length > 0 && !atMax && (
        <div className="flex flex-wrap gap-1.5">
          {openSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="rounded-pill border border-dashed border-line px-2.5 py-1 text-xs text-ink-soft hover:border-primary hover:text-primary"
            >
              + {s}
            </button>
          ))}
        </div>
      )}

      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((v) => (
            <span key={v} className="flex items-center gap-1 rounded-pill bg-primary-light px-3 py-1 text-xs font-medium text-primary">
              {v}
              <button type="button" onClick={() => remove(v)} aria-label="إزالة">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
