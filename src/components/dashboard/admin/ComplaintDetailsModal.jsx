import { CalendarDays, GraduationCap, Mail, MessageSquare, Tag, User, X } from 'lucide-react';
import { ComplaintStatusBadge } from './ComplaintStatusBadge';
import { formatDate } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line/60 pb-3">
      <span className="flex items-center gap-1.5 text-sm text-ink-soft">
        {label}
        {Icon && <Icon size={14} />}
      </span>
      <span className="text-sm font-semibold text-ink">{value}</span>
    </div>
  );
}

/**
 * الرسالة الكاملة (بلا قصّ ولا سطر واحد) — الحاجة الأصلية لهذه النافذة: عمود
 * "الرسالة" في الجدول يظهر فيه سطران كحد أقصى، وشكاوى نموذج "تواصل معنا" قد
 * تتجاوز 500 حرف فيصبح النص مبتوراً وغير مقروء دون مكان يعرضه كاملاً.
 */
export function ComplaintDetailsModal({ complaint, onClose }) {
  const t = useT();

  if (!complaint) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label="اغلاق"
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
          >
            <X size={18} />
          </button>
          <h3 className="flex-1 text-center text-lg font-bold text-ink">{t('dashboard.adminComplaints.detailsTitle')}</h3>
          <span className="w-8" />
        </div>

        <div className="flex flex-col gap-4">
          <InfoRow icon={User} label={t('dashboard.adminComplaints.colStudent')} value={complaint.studentName} />
          <InfoRow icon={GraduationCap} label={t('dashboard.adminComplaints.colTeacher')} value={complaint.teacherName} />
          <InfoRow icon={User} label={t('dashboard.adminComplaints.senderNameLabel')} value={complaint.senderName} />
          <InfoRow icon={Mail} label={t('dashboard.adminComplaints.senderEmailLabel')} value={complaint.senderEmail} />
          <InfoRow icon={Tag} label={t('dashboard.adminComplaints.categoryLabel')} value={complaint.categoryLabel} />
          <InfoRow icon={CalendarDays} label={t('dashboard.adminComplaints.colDate')} value={formatDate(complaint.createdAt)} />

          <div className="flex items-center justify-between gap-3 border-b border-line/60 pb-3">
            <span className="text-sm text-ink-soft">{t('dashboard.adminComplaints.colStatus')}</span>
            <ComplaintStatusBadge status={complaint.status} />
          </div>

          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-1.5 text-sm font-bold text-primary">
              {t('dashboard.adminComplaints.messageLabel')}
              <MessageSquare size={14} />
            </span>
            <p className="whitespace-pre-wrap rounded-xl bg-canvas p-3 text-sm text-ink">{complaint.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
