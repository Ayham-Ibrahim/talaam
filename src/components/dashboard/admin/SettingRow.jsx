import { useState } from 'react';
import { Check } from 'lucide-react';
import { useT } from '@/hooks/useT';

export function SettingRow({ setting, isPending, onSave }) {
  const t = useT();
  const [value, setValue] = useState(String(setting.value));
  const isDirty = value !== String(setting.value);
  const isValid = value.trim() !== '' && Number.isFinite(Number(value));

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/60 py-3 last:border-b-0">
      <span className="text-sm text-ink-soft">{setting.label}</span>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-btn border border-line bg-surface px-3 py-2">
          <input
            type="number"
            dir="ltr"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-16 bg-transparent text-left text-sm font-semibold text-ink outline-none"
          />
          <span className="text-xs text-ink-soft">{setting.unit}</span>
        </div>
        {isDirty && (
          <button
            type="button"
            disabled={!isValid || isPending}
            onClick={() => onSave(setting.key, Number(value))}
            title={t('dashboard.adminSettings.save')}
            className="flex h-9 w-9 items-center justify-center rounded-btn bg-success text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Check size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
