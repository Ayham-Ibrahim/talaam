import { useState } from 'react';
import { Check } from 'lucide-react';
import { ApiErrorList } from '@/components/ui';
import { useT } from '@/hooks/useT';

/**
 * كل إعداد له نوع فعلي (string/boolean/integer/decimal) قادم من الباك — الحقل
 * والقيمة المُرسلة عند الحفظ يجب أن يطابقا هذا النوع، وإلا يرسل input
 * type="number" قيماً نصية مثل "USD" فيرفضها المتصفح صامتاً (Number(value) => NaN).
 */
export function SettingRow({ setting, isPending, error, onSave }) {
  const t = useT();
  const isBoolean = setting.type === 'boolean';
  const isNumeric = setting.type === 'integer' || setting.type === 'decimal';

  const [value, setValue] = useState(isBoolean ? Boolean(setting.value) : String(setting.value ?? ''));

  const isDirty = isBoolean ? value !== Boolean(setting.value) : value !== String(setting.value ?? '');
  const isValid = isBoolean ? true : isNumeric ? value.trim() !== '' && Number.isFinite(Number(value)) : value.trim() !== '';

  const handleSave = () => {
    if (isBoolean) {
      onSave(setting.key, value);
    } else if (isNumeric) {
      onSave(setting.key, Number(value));
    } else {
      onSave(setting.key, value);
    }
  };

  return (
    <div className="border-b border-line/60 py-3 last:border-b-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-ink-soft">{setting.label}</span>
        <div className="flex items-center gap-2">
          {isBoolean ? (
            <button
              type="button"
              role="switch"
              dir="ltr"
              aria-checked={value}
              onClick={() => setValue((prev) => !prev)}
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${value ? 'bg-primary' : 'bg-line'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                  value ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 rounded-btn border border-line bg-surface px-3 py-2">
              <input
                type={isNumeric ? 'number' : 'text'}
                dir="ltr"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-16 bg-transparent text-left text-sm font-semibold text-ink outline-none"
              />
              <span className="text-xs text-ink-soft">{setting.unit}</span>
            </div>
          )}
          {isDirty && (
            <button
              type="button"
              disabled={!isValid || isPending}
              onClick={handleSave}
              title={t('dashboard.adminSettings.save')}
              className="flex h-9 w-9 items-center justify-center rounded-btn bg-success text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Check size={16} />
            </button>
          )}
        </div>
      </div>
      {error && <ApiErrorList error={error} labelFor={() => setting.label} className="mt-2" />}
    </div>
  );
}
