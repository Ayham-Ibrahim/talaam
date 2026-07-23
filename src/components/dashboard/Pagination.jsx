import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

function getVisiblePages(page, totalPages) {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  return [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
}

export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const visible = getVisiblePages(page, totalPages);

  const navButtonClass =
    'flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink-soft transition-colors hover:bg-line/30 disabled:pointer-events-none disabled:opacity-40';

  return (
    <div dir="ltr" className="flex items-center gap-2">
      <button type="button" disabled={page === 1} onClick={() => onChange(1)} className={navButtonClass}>
        <ChevronsLeft size={16} />
      </button>
      <button type="button" disabled={page === 1} onClick={() => onChange(page - 1)} className={navButtonClass}>
        <ChevronLeft size={16} />
      </button>

      {visible.map((p, idx) => {
        const prev = visible[idx - 1];
        const showEllipsis = prev !== undefined && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-2">
            {showEllipsis && <span className="px-1 text-ink-soft">...</span>}
            <button
              type="button"
              onClick={() => onChange(p)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                p === page ? 'bg-primary text-white' : 'border border-line text-ink hover:bg-line/30'
              }`}
            >
              {p}
            </button>
          </span>
        );
      })}

      <button type="button" disabled={page === totalPages} onClick={() => onChange(page + 1)} className={navButtonClass}>
        <ChevronRight size={16} />
      </button>
      <button type="button" disabled={page === totalPages} onClick={() => onChange(totalPages)} className={navButtonClass}>
        <ChevronsRight size={16} />
      </button>
    </div>
  );
}
