import { Ban, Flag, History, ShieldCheck, Trash2, X } from 'lucide-react';
import { Button, ErrorState, Skeleton } from '@/components/ui';
import { formatDateTime } from '@/lib/formatters';
import { useAdminComplaintConversation, useToggleConversationBlock } from '@/hooks/useChat';
import { useT } from '@/hooks/useT';

/**
 * اطلاع الأدمن على المحادثة من الشكوى المرتبطة بها فقط — يرى كل شيء بما فيه الرسائل
 * المحذوفة وسجل التعديلات، وكل فتح لهذه النافذة يُسجَّل في AuditLog بالباك اند.
 * لقطة وقت الطلب: الأدمن لا يشترك في قنوات WebSocket.
 */
export function AdminConversationModal({ complaint, onClose }) {
  const t = useT();
  const { data, isLoading, isError, refetch } = useAdminComplaintConversation(complaint.id);
  const toggleBlock = useToggleConversationBlock(complaint.id);

  const conversation = data?.conversation;
  const isBlocked = conversation?.status === 'blocked';
  const nameFor = (senderId) =>
    senderId === conversation?.student?.id ? conversation.student.name : conversation?.provider?.name;

  const handleToggle = () => {
    if (!isBlocked && !window.confirm(t('chat.admin.confirmBlock'))) return;
    toggleBlock.mutate({ conversationId: conversation.id, block: !isBlocked });
  };

  return (
    <div dir="rtl" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line/60 px-6 py-4">
          <h3 className="text-lg font-bold text-ink">{t('chat.admin.title')}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('chat.close')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        {isError ? (
          <div className="p-6">
            <ErrorState onRetry={refetch} />
          </div>
        ) : isLoading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/60 px-6 py-3 text-sm">
              <div className="text-ink">
                <span className="font-bold">{conversation.student?.name}</span>
                <span className="mx-2 text-ink-soft">↔</span>
                <span className="font-bold">{conversation.provider?.name}</span>
                <span
                  className={`mr-3 rounded-pill px-2.5 py-0.5 text-xs font-bold ${
                    isBlocked ? 'bg-accent-pink/10 text-accent-pink' : 'bg-success-light text-success'
                  }`}
                >
                  {isBlocked ? t('chat.admin.blocked') : t('chat.admin.active')}
                </span>
              </div>
              <Button
                size="sm"
                variant={isBlocked ? 'outline' : 'primary'}
                disabled={toggleBlock.isPending}
                onClick={handleToggle}
                className={isBlocked ? '' : '!bg-accent-pink hover:!bg-accent-pink/90'}
              >
                {isBlocked ? <ShieldCheck size={15} /> : <Ban size={15} />}
                {isBlocked ? t('chat.admin.unblock') : t('chat.admin.block')}
              </Button>
            </div>
            {toggleBlock.isError && (
              <p className="px-6 pt-2 text-xs text-accent-pink">{toggleBlock.error?.message}</p>
            )}

            <p className="px-6 pt-3 text-[11px] text-ink-soft">{t('chat.admin.auditNotice')}</p>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-4">
              {data.messages.length === 0 && (
                <p className="py-8 text-center text-sm text-ink-soft">{t('chat.admin.empty')}</p>
              )}
              {data.messages.map((message) => {
                if (message.type === 'system') {
                  return (
                    <div key={message.id} className="text-center text-xs text-ink-soft">
                      {t('chat.admin.system')}: {message.body} — {formatDateTime(message.created_at)}
                    </div>
                  );
                }
                const isReported = message.id === data.reported_message_id;
                return (
                  <div
                    key={message.id}
                    className={`rounded-xl border p-3 text-sm ${
                      isReported ? 'border-accent-pink bg-accent-pink/5' : 'border-line/60'
                    }`}
                  >
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-ink">{nameFor(message.sender_id)}</span>
                      <span className="flex items-center gap-2 text-ink-soft">
                        {isReported && (
                          <span className="flex items-center gap-1 font-bold text-accent-pink">
                            <Flag size={12} />
                            {t('chat.admin.reportedMessage')}
                          </span>
                        )}
                        {message.deleted_at && (
                          <span className="flex items-center gap-1 text-accent-pink">
                            <Trash2 size={12} />
                            {t('chat.admin.deletedByUser')}
                          </span>
                        )}
                        {formatDateTime(message.created_at)}
                      </span>
                    </div>
                    <p className={`whitespace-pre-wrap text-ink ${message.deleted_at ? 'line-through decoration-accent-pink/40' : ''}`}>
                      {message.body}
                    </p>
                    {message.edits?.length > 0 && (
                      <div className="mt-2 space-y-1 border-t border-line/60 pt-2">
                        <span className="flex items-center gap-1 text-[11px] font-bold text-ink-soft">
                          <History size={12} />
                          {t('chat.admin.editHistory')}
                        </span>
                        {message.edits.map((edit, i) => (
                          <p key={i} className="text-xs text-ink-soft">
                            {formatDateTime(edit.edited_at)} — {edit.old_body}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
