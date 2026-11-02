import { Link } from 'react-router-dom';
import { useT } from '@/hooks/useT';
import { LEGAL_PAGES } from '@/lib/legalPages';

/**
 * موافقة صريحة على سياسة الدور + الشروط والخصوصية عند التسجيل — الباك يرفض التسجيل بدونها
 * (accept_policy: accepted) ويحفظ لحظتها ونسخة السياسة (users.policy_accepted_at/policy_version).
 * الروابط تُفتح بتبويب جديد كي لا يضيع ما كُتب في النموذج. registration من register() في react-hook-form.
 */
export function PolicyAcceptanceCheckbox({ policySlug, registration, error }) {
  const t = useT();
  const linkClass = 'font-medium text-primary underline-offset-2 hover:underline';
  const policyLink = (slug) => (
    <Link to={LEGAL_PAGES[slug].path} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {t(LEGAL_PAGES[slug].titleKey)}
    </Link>
  );

  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-start gap-2 text-right">
        <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-primary" {...registration} />
        <span className="text-sm leading-relaxed text-ink-soft">
          {t('auth.policyAgreePrefix')} {policyLink(policySlug)}
          {t('auth.policyAgreeSep')}
          {policyLink('terms')}
          {t('auth.policyAgreeLastSep')}
          {policyLink('privacy')}
        </span>
      </label>
      {error && <span className="text-xs text-accent-pink">{error.message}</span>}
    </div>
  );
}
