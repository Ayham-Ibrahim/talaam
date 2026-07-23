import { FileText, Check, X as XIcon, ExternalLink } from 'lucide-react';
import { DOCUMENT_STATUS_STYLES, DOCUMENT_TYPE_LABELS } from '@/mocks/admin.mock';
import { formatDate } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

export function VerificationDocumentsList({ documents, onApprove, onReject, isActing }) {
  const t = useT();

  if (documents.length === 0) {
    return (
      <div className="rounded-2xl border border-[#F2F2F7] bg-white p-6 text-center shadow-card">
        <p className="text-sm text-ink-soft">{t('dashboard.adminTeacherDetail.documentsEmpty')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {documents.map((doc) => {
        const style = DOCUMENT_STATUS_STYLES[doc.status];
        return (
          <div key={doc.id} className="rounded-2xl border border-[#F2F2F7] bg-white p-4 shadow-card sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-pill px-3 py-1 text-xs font-bold" style={{ backgroundColor: style.bg, color: style.color }}>
                {style.label}
              </span>

              <div className="flex flex-1 items-center justify-end gap-2 text-right">
                <div>
                  <div className="font-semibold text-ink">{DOCUMENT_TYPE_LABELS[doc.type] ?? doc.type}</div>
                  <div className="text-xs text-ink-soft">
                    {t('dashboard.adminTeacherDetail.docUploadedAt')} {formatDate(doc.uploadedAt)}
                  </div>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EDF0F5] text-primary">
                  <FileText size={20} />
                </div>
              </div>
            </div>

            {doc.status === 'rejected' && doc.rejectionReason && (
              <p className="mt-3 rounded-xl bg-accent-pink/10 p-3 text-right text-sm text-ink">{doc.rejectionReason}</p>
            )}

            <div className="mt-3 flex items-center justify-end gap-2 border-t border-line/60 pt-3">
              <button
                type="button"
                title={t('dashboard.adminTeacherDetail.viewFile')}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-70"
              >
                {t('dashboard.adminTeacherDetail.viewFile')}
                <ExternalLink size={15} />
              </button>

              {doc.status === 'pending' && (
                <>
                  <span className="mx-1 h-4 w-px bg-line" />
                  <button
                    type="button"
                    disabled={isActing}
                    onClick={() => onApprove(doc.id)}
                    className="flex items-center gap-1.5 text-sm font-medium text-success hover:opacity-70 disabled:opacity-50"
                  >
                    {t('dashboard.adminTeacherDetail.approveDocument')}
                    <Check size={15} />
                  </button>
                  <button
                    type="button"
                    disabled={isActing}
                    onClick={() => onReject(doc.id)}
                    className="flex items-center gap-1.5 text-sm font-medium text-accent-pink hover:opacity-70 disabled:opacity-50"
                  >
                    {t('dashboard.adminTeacherDetail.rejectDocument')}
                    <XIcon size={15} />
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
