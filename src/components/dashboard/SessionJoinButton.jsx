import { useJoinSession } from '@/hooks/useSessionJoin';
import { handleSessionJoin } from '@/lib/joinSession';

/**
 * زر "انضم" لكل الجلسات. حين يتوفر join_redirect_url يكون رابطاً عادياً
 * (<a href>) يمرّ عبر المنصة (ClassSessionController::joinRedirect) فتتحقق من
 * الموعد، وتُنشئ الغرفة إن حذفها BBB، وتسجّل الحضور ثم تحوّل لـ BBB — بلا
 * window.open بعد await الذي يحجبه Safari وموانع النوافذ ومتصفحات التطبيقات
 * (واتساب/سناب) فلا يرى المستخدم شيئاً ويعيد الكبس.
 * بلا الرابط (جلسة انتهت، أو استجابة قديمة) يبقى المسار السابق عبر /join.
 */
export function SessionJoinButton({ session, className = '', children }) {
  const joinSession = useJoinSession();
  const href = session.joinRedirectUrl ?? session.join_redirect_url ?? null;

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      disabled={joinSession.isPending}
      onClick={() => handleSessionJoin(joinSession.mutateAsync, session.id)}
      className={className}
    >
      {children}
    </button>
  );
}
