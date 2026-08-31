import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

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
}) {
  const [open, setOpen] = useState(false);
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

  const selected = options.find((o) => o.value === value);

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
            {options.map((opt) => {
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
            })}
          </div>
        )}
      </div>
      {error && errorMessage && <p className="text-xs text-accent-pink">{errorMessage}</p>}
    </div>
  );
}
