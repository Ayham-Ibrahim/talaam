import { TAXONOMY_TYPES } from '@/mocks/adminTaxonomy.mock';

export function TaxonomyTypeTabs({ active, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {TAXONOMY_TYPES.map((type) => (
        <button
          key={type.key}
          type="button"
          onClick={() => onChange(type.key)}
          className={`rounded-2xl px-5 py-2.5 text-sm font-bold transition-colors ${
            active === type.key ? 'bg-primary text-white' : 'border border-line bg-white text-ink hover:bg-line/30'
          }`}
        >
          {type.label}
        </button>
      ))}
    </div>
  );
}
