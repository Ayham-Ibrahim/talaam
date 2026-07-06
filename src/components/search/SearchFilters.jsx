import { SlidersHorizontal, Layers, Bookmark, BookOpen, GraduationCap, Globe, Clock3, ChevronLeft, RotateCcw, Star } from 'lucide-react';
import { Button } from '@/components/ui';
import { useT } from '@/hooks/useT';

const RATING_VALUES = [4.5, 4.0, 3.0, 2.0];

function FilterSelect({ icon: Icon, label, options = [], value, onChange, placeholder }) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-1.5 text-sm font-bold text-ink">
        <Icon size={15} className="text-ink-soft" /> {label}
      </label>
      <div className="relative">
        <select
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
          className="w-full appearance-none rounded-xl border border-line bg-surface py-2.5 pl-9 pr-3 text-sm text-ink-soft outline-none focus:border-primary"
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronLeft size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
      </div>
    </div>
  );
}

export function SearchFilters({ meta, draft, onChange, onApply, onReset }) {
  const t = useT();
  const priceMin = meta?.priceRange?.min ?? 50;
  const priceMax = meta?.priceRange?.max ?? 550;
  const ratingOptions = t('search.ratingOptions');

  return (
    <aside className="w-full shrink-0 lg:w-72">
      <h3 className="mb-5 flex items-center gap-2 font-bold text-ink">
        <SlidersHorizontal size={18} /> {t('search.filterTitle')}
      </h3>

      <div className="space-y-5">
        <FilterSelect
          icon={Layers}
          label={t('search.level')}
          placeholder={t('search.select')}
          options={meta?.levels}
          value={draft.level}
          onChange={(v) => onChange('level', v)}
        />
        <FilterSelect
          icon={Bookmark}
          label={t('search.grade')}
          placeholder={t('search.select')}
          options={meta?.grades}
          value={draft.grade}
          onChange={(v) => onChange('grade', v)}
        />
        <FilterSelect
          icon={BookOpen}
          label={t('search.subject')}
          placeholder={t('search.select')}
          options={meta?.subjects}
          value={draft.subject}
          onChange={(v) => onChange('subject', v)}
        />
        <FilterSelect
          icon={GraduationCap}
          label={t('search.stage')}
          placeholder={t('search.select')}
          options={meta?.stages}
          value={draft.stage}
          onChange={(v) => onChange('stage', v)}
        />
        <FilterSelect
          icon={Globe}
          label={t('search.language')}
          placeholder={t('search.select')}
          options={meta?.languages}
          value={draft.language}
          onChange={(v) => onChange('language', v)}
        />
        <FilterSelect
          icon={Clock3}
          label={t('search.availability')}
          placeholder={t('search.select')}
          options={[]}
          value={draft.availability}
          onChange={(v) => onChange('availability', v)}
        />

        {/* Price range */}
        <div>
          <div className="mb-2 flex items-center justify-between text-sm font-bold text-ink">
            <span>{t('search.price')}</span>
            <span className="text-xs font-medium text-ink-soft">${priceMax}</span>
          </div>
          <input
            type="range"
            min={priceMin}
            max={priceMax}
            step={5}
            value={draft.minPrice ?? priceMin}
            onChange={(e) => onChange('minPrice', Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="mt-1 text-xs font-medium text-ink-soft">من ${draft.minPrice ?? priceMin}</div>
        </div>

        {/* Rating */}
        <div>
          <h4 className="mb-2.5 flex items-center gap-1.5 text-sm font-bold text-ink">
            <Star size={15} className="text-ink-soft" /> {t('search.rating')}
          </h4>
          <div className="space-y-2">
            {ratingOptions.map((label, i) => (
              <label key={label} className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  checked={draft.minRating === RATING_VALUES[i]}
                  onChange={() => onChange('minRating', draft.minRating === RATING_VALUES[i] ? null : RATING_VALUES[i])}
                  className="h-4 w-4 rounded accent-primary"
                />
                <span className="inline-flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      size={13}
                      className={s < Math.round(RATING_VALUES[i]) ? 'fill-star text-star' : 'text-line'}
                    />
                  ))}
                </span>
                {label}
              </label>
            ))}
          </div>
        </div>

        <Button className="w-full justify-center" onClick={onApply}>
          {t('search.apply')}
        </Button>
        <button
          onClick={onReset}
          className="flex w-full items-center justify-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
        >
          {t('search.reset')} <RotateCcw size={14} />
        </button>
      </div>
    </aside>
  );
}
