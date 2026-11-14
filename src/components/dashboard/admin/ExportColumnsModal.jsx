import { useEffect, useState } from 'react';
import { Check, FileSpreadsheet, X } from 'lucide-react';
import { ApiErrorList, Skeleton } from '@/components/ui';
import { useT } from '@/hooks/useT';

function readSaved(storageKey) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? 'null');
    return Array.isArray(saved) ? saved : null;
  } catch {
    return null;
  }
}

function save(storageKey, keys) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(keys));
  } catch {
    // التخزين محجوب (تصفح خاص) — يعود الاختيار للكل في المرة القادمة فقط
  }
}

/**
 * اختيار أعمدة ملف Excel قبل تصديره — عام لأي تصدير يدعم columns[] بالباك (SelectableColumns).
 * columns: [{key, label}] من الباك بترتيب الملف. آخر اختيار يُحفظ في المتصفح (storageKey)،
 * ومفاتيح محفوظة لم تعد موجودة تُتجاهل؛ بلا حفظ سابق يُحدَّد الكل.
 */
export function ExportColumnsModal({ title, columns, isLoading, storageKey, isPending, error, onExport, onClose }) {
  const t = useT();
  const [selected, setSelected] = useState(null);

  // تهيئة الاختيار عند وصول قائمة الأعمدة
  useEffect(() => {
    if (!columns || selected !== null) return;
    const keys = columns.map((c) => c.key);
    const saved = readSaved(storageKey)?.filter((k) => keys.includes(k));
    setSelected(saved?.length ? saved : keys);
  }, [columns, selected, storageKey]);

  const chosen = selected ?? [];
  const toggle = (key) => setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const handleExport = () => {
    // ترتيب التعريف لا ترتيب النقر — الباك يرتّب أيضاً، لكن المحفوظ يبقى مرتباً
    const keys = columns.map((c) => c.key).filter((k) => chosen.includes(k));
    save(storageKey, keys);
    onExport(keys.length === columns.length ? undefined : keys);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div dir="rtl" className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-lg font-bold text-ink">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('exportColumns.close')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-ink-soft">{t('exportColumns.hint')}</p>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-ink-soft">
            {t('exportColumns.selectedCount')} {chosen.length} / {columns?.length ?? 0}
          </span>
          <div className="flex gap-3">
            <button type="button" onClick={() => setSelected(columns.map((c) => c.key))} className="font-medium text-primary hover:opacity-70">
              {t('exportColumns.selectAll')}
            </button>
            <button type="button" onClick={() => setSelected([])} className="font-medium text-ink-soft hover:text-ink">
              {t('exportColumns.clearAll')}
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
          {isLoading || !columns
            ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-11 rounded-xl" />)
            : columns.map((col) => {
                const on = chosen.includes(col.key);
                return (
                  <button
                    key={col.key}
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => toggle(col.key)}
                    className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-right text-sm transition-colors ${
                      on ? 'border-primary bg-primary/5 text-ink' : 'border-line text-ink-soft hover:bg-line/30'
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                        on ? 'border-primary bg-primary text-white' : 'border-line bg-white'
                      }`}
                    >
                      {on && <Check size={14} />}
                    </span>
                    {col.label}
                  </button>
                );
              })}
        </div>

        {error && <ApiErrorList error={error} labelFor={() => null} className="mt-3" />}

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-line py-3 text-sm font-medium text-ink-soft hover:bg-line/30">
            {t('exportColumns.cancel')}
          </button>
          <button
            type="button"
            disabled={chosen.length === 0 || isPending}
            onClick={handleExport}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-3 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
          >
            <FileSpreadsheet size={16} />
            {isPending ? t('exportColumns.exporting') : t('exportColumns.export')}
          </button>
        </div>
      </div>
    </div>
  );
}
