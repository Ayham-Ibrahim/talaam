import { useState } from 'react';
import { Bell, Check } from 'lucide-react';
import {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/hooks/useNotifications';
import { formatDateTime } from '@/lib/formatters';
import { DOCUMENT_TYPE_LABELS } from '@/mocks/admin.mock';
import { useT } from '@/hooks/useT';

function notificationContent(t, notification) {
  const { type, data } = notification;
  switch (type) {
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
    case 'RescheduleRequestReviewed':
      return {
        title: data.status === 'rejected' ? t('notifications.rescheduleRejected') : t('notifications.rescheduleApproved'),
        body: data.status === 'rejected' ? data.reason : data.newScheduledAt ? formatDateTime(data.newScheduledAt) : null,
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
  const [open, setOpen] = useState(false);

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
                const { title, body } = notificationContent(t, notification);
                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => !notification.readAt && markRead.mutate(notification.id)}
                    className={`flex w-full flex-col gap-0.5 border-b border-line/40 px-4 py-3 text-right last:border-b-0 hover:bg-line/20 ${
                      notification.readAt ? '' : 'bg-primary/5'
                    }`}
                  >
                    <span className="text-sm font-semibold text-ink">{title}</span>
                    {body && <span className="text-xs text-ink-soft">{body}</span>}
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
