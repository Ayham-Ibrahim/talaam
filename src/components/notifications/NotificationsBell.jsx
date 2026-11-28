import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Copy } from 'lucide-react';
import {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/hooks/useNotifications';
import { formatDateTime } from '@/lib/formatters';
import { DOCUMENT_TYPE_LABELS } from '@/mocks/admin.mock';
import { useAuth } from '@/hooks/useAuth';
import { useT } from '@/hooks/useT';

/** صفحة الجلسة لكل دور — المعلم له صفحة تفاصيل، الطالب والأدمن جدول فيه زر "الملفات" */
function sessionPathFor(role, sessionId) {
  if (role === 'teacher') return `/dashboard/teacher/sessions/${sessionId}`;
  if (role === 'admin') return '/dashboard/admin/sessions';
  return '/dashboard/student/sessions';
}

function notificationContent(t, notification, role) {
  const { type, data } = notification;
  switch (type) {
    case 'SessionAttachmentUploaded':
      return {
        title: t(`notifications.sessionAttachmentUploaded.${data.uploaderRole}`),
        body: [data.title || data.fileName, data.sessionScheduledAt ? formatDateTime(data.sessionScheduledAt) : null]
          .filter(Boolean)
          .join(' — '),
        link: sessionPathFor(role, data.sessionId),
      };
    case 'NewChatMessage':
      return {
        title: t('chat.toastFrom').replace('{name}', data.senderName ?? ''),
        body: data.preview,
        link: `/dashboard/messages/${data.conversationId}`,
      };
    case 'TeacherVerificationReviewed':
      return {
        title: data.approved ? t('notifications.teacherApproved') : t('notifications.teacherRejected'),
        body: !data.approved ? data.reason : null,
      };
    case 'TeacherInvited':
      return { title: t('notifications.teacherInvited'), body: null };
    case 'StudentImported':
      return { title: t('notifications.studentImported'), body: null };
    case 'SessionReminder':
      return { title: t('notifications.sessionReminder'), body: formatDateTime(data.scheduled_at) };
    case 'SubscriptionEndingSoon':
      return {
        title: t('notifications.subscriptionEndingSoon').replace('{name}', data.studentName),
        body: [data.packageTitle, data.teacherName, `${t('notifications.subscriptionEndingSoonLast')} ${formatDateTime(data.lastSessionAt)}`]
          .filter(Boolean)
          .join(' — '),
        link: `/dashboard/admin/students/${data.studentId}`,
      };
    case 'BookingRequestReceived':
      return {
        title: t('notifications.bookingRequestReceived').replace('{name}', data.studentName),
        body: [data.packageTitle, `${t('notifications.bookingRequestReceivedDeadline')} ${formatDateTime(data.deadline)}`].join(' — '),
        link: '/dashboard/teacher/booking-requests',
      };
    case 'SessionQualityRatingRequested':
      return { title: t('notifications.sessionQualityRequested'), body: t('notifications.sessionQualityRequestedHint'), link: data.link };
    case 'SessionQualityRatingLinkSent':
      // للمعلم: الرابط يُنسخ (ليرسله للطالب خارج المنصة) لا يُفتح
      return { title: t('notifications.sessionQualityLinkSent'), body: t('notifications.sessionQualityLinkSentHint'), copyLink: data.link };
    case 'RescheduleRequestReviewed': {
      if (data.status === 'rejected') {
        return {
          title: data.kind === 'makeup' ? t('notifications.makeupRejected') : t('notifications.rescheduleRejected'),
          body: data.reason,
        };
      }
      const dateLine = data.newScheduledAt ? formatDateTime(data.newScheduledAt) : null;
      const body = [dateLine, data.adminNotes].filter(Boolean).join(' — ') || null;
      return {
        title: data.byCounterparty ? t('notifications.rescheduleAcceptedByCounterparty') : t('notifications.rescheduleApproved'),
        body,
      };
    }
    case 'RescheduleRequestSubmitted':
      return {
        title: data.kind === 'makeup'
          ? (data.forReviewer ? t('notifications.makeupSubmittedForReview') : t('notifications.makeupSent'))
          : data.forReviewer
          ? t('notifications.rescheduleSubmittedForReview')
          : data.awaitingCounterparty
            ? t('notifications.rescheduleSentToCounterparty')
            : t('notifications.rescheduleSubmitted'),
        body: data.proposedScheduledAt ? formatDateTime(data.proposedScheduledAt) : data.reason ?? null,
      };
    case 'MakeupSessionScheduled':
      return {
        title: data.byAgreement ? t('notifications.makeupScheduledByAgreement') : t('notifications.makeupScheduled'),
        body: data.makeupScheduledAt ? formatDateTime(data.makeupScheduledAt) : null,
      };
    case 'RescheduleResponseRequested':
      return {
        title: t(
          data.kind === 'makeup'
            ? `notifications.makeupResponseRequested.${data.requesterRole}`
            : `notifications.rescheduleResponseRequested.${data.requesterRole}`,
        ),
        body: `${t('dashboard.rescheduleResponse.proposed')}: ${formatDateTime(data.proposedScheduledAt)}`,
        link: role === 'teacher' ? `/dashboard/teacher/sessions/${data.sessionId}` : '/dashboard/student/sessions',
      };
    case 'RescheduleRequestEscalated':
      return {
        title: data.kind === 'makeup'
          ? (data.forReviewer ? t('notifications.makeupEscalatedForReview') : t('notifications.makeupEscalated'))
          : (data.forReviewer ? t('notifications.rescheduleEscalatedForReview') : t('notifications.rescheduleEscalated')),
        body: t(`notifications.rescheduleEscalatedCause.${data.cause}`),
        link: data.forReviewer ? '/dashboard/admin/complaints' : null,
      };
    case 'VerificationDocumentRejected':
      return {
        title: t('notifications.documentRejected'),
        body: `${DOCUMENT_TYPE_LABELS[data.type] ?? data.type}: ${data.reason}`,
      };
    default:
      return { title: type, body: null };
  }
}

export function NotificationsBell({ buttonClassName, iconClassName = 'text-ink-soft', iconSize = 18 }) {
  const t = useT();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const copyToClipboard = async (notificationId, path) => {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt(t('notifications.copyLinkFallback'), url);
      return;
    }
    setCopiedId(notificationId);
    setTimeout(() => setCopiedId((id) => (id === notificationId ? null : id)), 2500);
  };

  const { data: unreadCount } = useUnreadNotificationsCount();
  const { data: notifications, isLoading } = useNotifications({ enabled: open });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('nav.notifications')}
        className={buttonClassName ?? 'relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-line/40'}
      >
        <Bell size={iconSize} className={iconClassName} />
        {!!unreadCount && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-pink" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            dir="rtl"
            className="absolute left-0 top-full z-20 mt-2 max-h-96 w-80 overflow-y-auto rounded-2xl border border-line bg-white py-2 shadow-lift"
          >
            <div className="flex items-center justify-between border-b border-line/60 px-4 py-2.5">
              <span className="text-sm font-bold text-ink">{t('notifications.title')}</span>
              {!!unreadCount && (
                <button
                  type="button"
                  onClick={() => markAllRead.mutate()}
                  disabled={markAllRead.isPending}
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:opacity-70 disabled:opacity-50"
                >
                  {t('notifications.markAllRead')}
                  <Check size={13} />
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="px-4 py-6 text-center text-sm text-ink-soft">…</div>
            ) : !notifications || notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-ink-soft">{t('notifications.empty')}</div>
            ) : (
              notifications.map((notification) => {
                const { title, body, link, copyLink } = notificationContent(t, notification, user?.role);
                const isCopied = copiedId === notification.id;
                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => {
                      if (!notification.readAt) markRead.mutate(notification.id);
                      // رابط للنسخ (رابط تقييم الجلسة عند المعلم): يُنسخ وتبقى القائمة مفتوحة
                      if (copyLink) {
                        copyToClipboard(notification.id, copyLink);
                        return;
                      }
                      // إشعار برابط (صفحة تقييم الجلسة عند الطالب مثلاً): يفتحها مباشرة
                      if (link) {
                        setOpen(false);
                        navigate(link);
                      }
                    }}
                    className={`flex w-full flex-col gap-0.5 border-b border-line/40 px-4 py-3 text-right last:border-b-0 hover:bg-line/20 ${
                      notification.readAt ? '' : 'bg-primary/5'
                    }`}
                  >
                    <span className="text-sm font-semibold text-ink">{title}</span>
                    {body && <span className="text-xs text-ink-soft">{body}</span>}
                    {link && <span className="text-xs font-semibold text-primary">{t('notifications.openLink')}</span>}
                    {copyLink && (
                      <span className={`flex items-center gap-1 text-xs font-semibold ${isCopied ? 'text-success' : 'text-primary'}`}>
                        {isCopied ? <Check size={13} /> : <Copy size={13} />}
                        {isCopied ? t('notifications.linkCopied') : t('notifications.copyLink')}
                      </span>
                    )}
                    <span className="text-[11px] text-ink-soft/70">{formatDateTime(notification.createdAt)}</span>
                  </button>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
