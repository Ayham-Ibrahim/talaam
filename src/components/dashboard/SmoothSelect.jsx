import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

/** Custom dropdown — native <select> can't be restyled, so this renders its own smooth, brand-colored option panel. */
export function SmoothSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  className = "",
  error = false,
  errorMessage = null,
  searchPlaceholder = "بحث...",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const filteredOptions = query.trim()
    ? options.filter((o) => o.label?.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  return (
    <div
      ref={rootRef}
      className={`flex  flex-col items-start gap-1.5 ${className}`}
    >
      {label && (
        <label className="text-sm font-semibold text-primary">{label}</label>
      )}
      <div className="relative w-full">
        <button
          type="button"
          aria-invalid={error}
          onClick={() => setOpen((v) => !v)}
          className={`flex w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 py-3 text-sm transition-colors duration-150 ${
            error
              ? "border-accent-pink"
              : open
                ? "border-primary"
                : "border-[#E3E3E3] hover:border-primary/40"
          }`}
        >
          <ChevronDown
            size={16}
            className={`shrink-0 text-ink-soft transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
          <span className={selected ? "text-ink" : "text-[#AEAEB2]"}>
            {selected ? selected.label : placeholder}
          </span>
        </button>

        {open && (
          <div className="absolute z-20 mt-2 w-full origin-top animate-fade-in overflow-hidden rounded-2xl bg-white p-2 shadow-lift">
            {options.length > 6 && (
              <div className="mb-1 flex items-center gap-2 rounded-xl border border-[#E3E3E3] px-3 py-2">
                <Search size={14} className="shrink-0 text-ink-soft" />
                <input
                  type="text"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder={searchPlaceholder}
                  className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-[#AEAEB2]"
                />
              </div>
            )}
            <div className="max-h-64 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <p className="px-4 py-3 text-center text-sm text-ink-soft">لا توجد نتائج</p>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setOpen(false);
                      }}
                      className={`w-full rounded-xl px-4 py-3 text-start text-sm transition-colors duration-150 ${
                        isSelected
                          ? "bg-primary/10 font-semibold text-primary"
                          : "text-ink hover:bg-primary/10 hover:text-primary"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
      {error && errorMessage && <p className="text-xs text-accent-pink">{errorMessage}</p>}
    </div>
  );
}
