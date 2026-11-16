import { useRef, useState } from 'react';
import { FileText, Image as ImageIcon, Paperclip, Trash2, Upload } from 'lucide-react';
import { ApiErrorList, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useDeleteSessionAttachment, useSessionAttachments, useUploadSessionAttachment } from '@/hooks/useSessionAttachments';
import { formatDateTime } from '@/lib/formatters';
import { ATTACHMENT_ACCEPT } from '@/services/sessionAttachmentService';
import { useT } from '@/hooks/useT';

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AttachmentRow({ attachment, onDelete, isDeleting, t, timezone }) {
  const Icon = attachment.mime_type?.startsWith('image/') ? ImageIcon : FileText;

  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <a
        href={attachment.download_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-w-0 flex-1 items-center gap-3 text-right"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EDF0F5]">
          <Icon size={18} className="text-primary" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-ink hover:text-primary">
            {attachment.title || attachment.original_name}
          </div>
          <div className="truncate text-xs text-ink-soft">
            {t(`dashboard.sessionAttachments.roles.${attachment.uploader_role}`)}
            {attachment.uploader?.name ? ` — ${attachment.uploader.name}` : ''}
            {' · '}
            {formatDateTime(attachment.created_at, timezone)}
            {attachment.size_bytes ? ` · ${formatSize(attachment.size_bytes)}` : ''}
          </div>
        </div>
      </a>
      {attachment.can_delete && (
        <button
          type="button"
          onClick={() => onDelete(attachment)}
          disabled={isDeleting}
          aria-label={t('dashboard.sessionAttachments.delete')}
          title={t('dashboard.sessionAttachments.delete')}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-accent-pink/10 hover:text-accent-pink disabled:opacity-50"
        >
          <Trash2 size={16} />
        </button>
      )}
    </li>
  );
}

/**
 * قسم "ملفات الجلسة": المعلم والطالب يتبادلان الملفات مباشرة بلا موظف وسيط.
 * الباك اند يحدد ما يظهر لكل طرف (ملف الطالب لا يراه زملاؤه في جلسة المجموعة)،
 * ومن يحق له الرفع (canUpload يخفي النموذج فقط — الرفض الفعلي من الباك اند).
 */
export function SessionAttachmentsPanel({ sessionId, canUpload = true, className = '' }) {
  const t = useT();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const { data: attachments = [], isLoading, isError, refetch } = useSessionAttachments(sessionId);
  const upload = useUploadSessionAttachment(sessionId);
  const remove = useDeleteSessionAttachment(sessionId);

  const handleUpload = () => {
    if (!file) return;
    upload.mutate(
      { file, title },
      {
        onSuccess: () => {
          setFile(null);
          setTitle('');
          if (fileInputRef.current) fileInputRef.current.value = '';
        },
      },
    );
  };

  const handleDelete = (attachment) => {
    if (!window.confirm(t('dashboard.sessionAttachments.deleteConfirm'))) return;
    remove.mutate(attachment.id, {
      onError: (err) => window.alert(err?.message ?? t('dashboard.sessionAttachments.deleteFailed')),
    });
  };

  const fieldLabel = (path) =>
    path === 'file' ? t('dashboard.sessionAttachments.fileLabel') : path === 'title' ? t('dashboard.sessionAttachments.titleLabel') : path;

  return (
    <div className={`rounded-2xl border border-[#F2F2F7] bg-white p-5 shadow-card ${className}`}>
      <div className="mb-3 flex items-center justify-start gap-2">
        <Paperclip size={18} className="text-primary" />
        <h3 className="text-right text-sm font-bold text-ink">{t('dashboard.sessionAttachments.title')}</h3>
      </div>

      {isError ? (
        <div className="flex items-center justify-between gap-3 py-2 text-sm text-ink-soft">
          <span>{t('dashboard.sessionAttachments.loadFailed')}</span>
          <button type="button" onClick={() => refetch()} className="font-bold text-primary hover:underline">
            {t('dashboard.sessionAttachments.retry')}
          </button>
        </div>
      ) : isLoading ? (
        <Skeleton className="h-16 rounded-xl" />
      ) : attachments.length === 0 ? (
        <p className="py-2 text-right text-sm text-ink-soft">{t('dashboard.sessionAttachments.empty')}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line">
          {attachments.map((attachment) => (
            <AttachmentRow
              key={attachment.id}
              attachment={attachment}
              onDelete={handleDelete}
              isDeleting={remove.isPending && remove.variables === attachment.id}
              t={t}
              timezone={user?.timezone}
            />
          ))}
        </ul>
      )}

      {canUpload && (
        <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex flex-1 cursor-pointer items-center gap-2 overflow-hidden rounded-xl border border-dashed border-primary/50 bg-[#F7F8FD] px-4 py-2.5 text-sm text-ink-soft hover:border-primary">
              <Upload size={16} className="shrink-0 text-primary" />
              <span className="truncate">{file ? file.name : t('dashboard.sessionAttachments.chooseFile')}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept={ATTACHMENT_ACCEPT}
                className="hidden"
                onChange={(e) => {
                  upload.reset();
                  setFile(e.target.files?.[0] ?? null);
                }}
              />
            </label>
            <input
              type="text"
              value={title}
              maxLength={150}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('dashboard.sessionAttachments.titlePlaceholder')}
              className="flex-1 rounded-xl border border-line px-4 py-2.5 text-right text-sm text-ink outline-none focus:border-primary"
            />
          </div>
          <p className="text-right text-xs text-ink-soft">{t('dashboard.sessionAttachments.hint')}</p>
          <ApiErrorList error={upload.error} labelFor={fieldLabel} />
          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || upload.isPending}
            className="mr-auto inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
          >
            <Upload size={16} />
            {upload.isPending ? t('dashboard.sessionAttachments.uploading') : t('dashboard.sessionAttachments.upload')}
          </button>
        </div>
      )}
    </div>
  );
}
