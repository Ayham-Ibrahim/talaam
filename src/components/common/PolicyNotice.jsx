import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';
import { useT } from '@/hooks/useT';
import { LEGAL_PAGES } from '@/lib/legalPages';

/**
 * تنبيه قصير بقاعدة من سياسة الطالب/المعلم في موضع تطبيقها (الدفع، تغيير الموعد، الجلسة،
 * طلبات الحجز) مع رابط للسياسة كاملة بتبويب جديد. النص كامل من i18n، والرابط اختياري.
 */
export function PolicyNotice({ children, policySlug, className = '' }) {
  const t = useT();

  return (
    <div className={`flex items-start gap-2 rounded-xl border border-primary/15 bg-primary/5 p-3 text-right ${className}`}>
      <Info size={16} className="mt-0.5 shrink-0 text-primary" />
      <p className="text-xs leading-relaxed text-ink-soft">
        {children}
        {policySlug && (
          <>
            {' '}
            <Link
              to={LEGAL_PAGES[policySlug].path}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              {t('policyNotice.readPolicy')}
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
