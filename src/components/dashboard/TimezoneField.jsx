import { SmoothSelect } from './SmoothSelect';
import { listTimezones, getBrowserTimezone } from '@/lib/timezone';
import { useT } from '@/hooks/useT';

const TIMEZONE_OPTIONS = listTimezones().map((tz) => ({ value: tz, label: tz }));

/**
 * الاثنان معاً: اكتشاف تلقائي من المتصفح (المصدر الافتراضي، يعمل بصمت من App.jsx
 * في كل تحميل) أو تثبيت يدوي هنا يوقف ذلك الاكتشاف مستقبلاً — انظر
 * ProfileController::syncTimezone / updateProfile في الباك لمنطق من يطغى على من.
 */
export function TimezoneField({ timezone, auto, onChange }) {
  const t = useT();

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-ink">{t('studentSettings.timezoneLabel')}</span>

      <label className="flex items-center justify-end gap-2 text-sm text-ink-soft">
        {t('studentSettings.timezoneAutoLabel')}
        <input
          type="checkbox"
          checked={auto}
          onChange={(e) =>
            onChange({ auto: e.target.checked, timezone: e.target.checked ? getBrowserTimezone() : timezone })
          }
          className="h-4 w-4 rounded border-line text-primary focus:ring-primary/30"
        />
      </label>

      {auto ? (
        <div className="rounded-btn border border-line bg-canvas p-3 text-sm text-ink-soft" dir="ltr">
          {timezone || getBrowserTimezone()}
        </div>
      ) : (
        <SmoothSelect
          value={timezone}
          onChange={(v) => onChange({ auto: false, timezone: v })}
          options={TIMEZONE_OPTIONS}
          placeholder="—"
        />
      )}
    </div>
  );
}
