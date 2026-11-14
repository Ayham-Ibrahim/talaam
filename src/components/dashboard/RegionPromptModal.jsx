import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { CountryRegionFields, useLocationOptions } from '@/components/dashboard/CountryRegionFields';
import { ApiErrorList } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useMyLocationStatus, useUpdateMyLocation } from '@/hooks/useStudentAccount';
import { useT } from '@/hooks/useT';

const DISMISS_KEY = 'taalam-region-prompt-dismissed';

function wasDismissed() {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * يطلب الدولة والولاية من طالب أكمل ملفه قبل إضافتهما (DashboardLayout) — عليهما تُبنى
 * تقارير التسويق. من لم يكمل ملفه بعد يمرّ أصلاً بصفحة إكمال البيانات التي تطلبهما، وحساب
 * الحملة يختارهما عند التسجيل، فلا تظهر لهما. "لاحقاً" يخفيها حتى نهاية الجلسة فقط.
 */
export function RegionPromptModal() {
  const t = useT();
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(wasDismissed);
  const [location, setLocation] = useState({ country_id: '', region_id: '' });
  const eligible = user?.role === 'student' && user.student?.education_type != null && !dismissed;
  const status = useMyLocationStatus(eligible);
  const options = useLocationOptions(location.country_id, location.region_id, eligible);
  const updateLocation = useUpdateMyLocation();

  if (!eligible || !status.isSuccess || user.student?.country_id != null) return null;

  const canSave = location.country_id !== '' && (!options.hasRegions || location.region_id !== '');

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // التخزين محجوب (تصفح خاص) — الإخفاء يبقى لهذه الصفحة فقط
    }
    setDismissed(true);
  };

  const save = () =>
    updateLocation.mutate({
      country_id: Number(location.country_id),
      region_id: location.region_id ? Number(location.region_id) : null,
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div dir="rtl" className="w-full max-w-md rounded-2xl bg-white p-6 text-right shadow-lift">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MapPin size={22} />
        </span>
        <h3 className="mt-4 text-center text-lg font-bold text-ink">{t('regionPrompt.title')}</h3>
        <p className="mt-2 text-center text-sm leading-relaxed text-ink-soft">{t('regionPrompt.body')}</p>

        <div className="mt-5">
          <CountryRegionFields
            {...options}
            countryId={location.country_id}
            regionId={location.region_id}
            onCountryChange={(v) => setLocation({ country_id: v, region_id: '' })}
            onRegionChange={(v) => setLocation((prev) => ({ ...prev, region_id: v }))}
          />
        </div>

        {updateLocation.isError && <ApiErrorList error={updateLocation.error} labelFor={() => null} className="mt-3" />}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={dismiss}
            className="flex-1 rounded-xl border border-line py-3 text-sm font-medium text-ink-soft hover:bg-line/30"
          >
            {t('regionPrompt.later')}
          </button>
          <button
            type="button"
            disabled={!canSave || updateLocation.isPending}
            onClick={save}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {updateLocation.isPending ? t('completeProfile.saving') : t('completeProfile.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
