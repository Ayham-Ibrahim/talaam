import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useT } from '@/hooks/useT';

/**
 * زر "نسخ رابط التقييم" للمعلم — path من الباك (session.quality_rating_path)، لا يصل إلا بعد
 * بدء الجلسة ودخوله ودخول الطالب. يُستخدَم بجدول الجلسات وبصفحة تفاصيل الجلسة.
 */
export function CopyRatingLinkButton({ path, compact = false }) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  if (!path) return null;

  const copy = async () => {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt(t('dashboard.teacherSessions.copyRatingLinkFallback'), url);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const size = compact ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm';
  const Icon = copied ? Check : Copy;

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border font-medium ${size} ${
        copied ? 'border-success text-success' : 'border-primary text-primary hover:bg-primary/5'
      }`}
    >
      <Icon size={compact ? 14 : 16} />
      {copied ? t('dashboard.teacherSessions.ratingLinkCopied') : t('dashboard.teacherSessions.copyRatingLink')}
    </button>
  );
}
