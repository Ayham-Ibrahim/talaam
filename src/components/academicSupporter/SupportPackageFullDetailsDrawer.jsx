import { CheckCircle2, Crown, GraduationCap } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { useT } from '@/hooks/useT';

/**
 * درج "كامل التفاصيل" — وصف الباقة ونوعها وقائمة الخدمات المشمولة فقط، بلا أي
 * خطوة دفع (ذلك من مهام SupportPackageDetailsDrawer). زر "احجز الآن" بالأسفل
 * يُغلق هذا الدرج ويفتح درج الدفع عبر onBookNow.
 */
export function SupportPackageFullDetailsDrawer({ supportPackage, onClose, onBookNow }) {
  const t = useT();
  const features = supportPackage
    ? t(`academicSupporter.supportPackages.${supportPackage.tier === 'premium' ? 'premium' : 'basic'}Features`)
    : [];

  return (
    <Drawer open={Boolean(supportPackage)} onClose={onClose} title={supportPackage?.title}>
      {supportPackage && (
        <div className="flex flex-col gap-5 text-start">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-pill bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            {supportPackage.tier === 'premium' ? <Crown size={13} className="text-amber-500" /> : <GraduationCap size={13} />}
            {t(`academicSupporter.supportPackages.tier${supportPackage.tier === 'premium' ? 'Premium' : 'Basic'}`)}
          </span>

          {supportPackage.subjects?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {supportPackage.subjects.map((s) => (
                <span key={s.id} className="flex items-center gap-1 rounded-pill bg-line/40 px-3 py-1 text-xs font-medium text-ink-soft">
                  <GraduationCap size={13} />
                  {s.name}
                </span>
              ))}
            </div>
          )}

          {supportPackage.description && <p className="text-sm leading-relaxed text-ink-soft">{supportPackage.description}</p>}

          {Array.isArray(features) && features.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-bold text-ink">{t('academicSupporter.supportPackages.featuresTitle')}</span>
              <ul className="flex flex-col gap-2.5">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-ink-soft">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={() => onBookNow?.(supportPackage)}
            className="rounded-2xl bg-primary py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            {t('academicSupporter.supportPackages.bookNow')}
          </button>
        </div>
      )}
    </Drawer>
  );
}
