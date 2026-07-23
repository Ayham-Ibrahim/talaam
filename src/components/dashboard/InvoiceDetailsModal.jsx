import { BookOpen, CalendarDays, Clock, CreditCard, FileText, Hash, LayoutGrid, ListOrdered, User, X } from 'lucide-react';
import { PACKAGE_TYPE_STYLES } from '@/mocks/dashboard.mock';
import { useT } from '@/hooks/useT';

function InfoRow({ icon: Icon, label, value }) {
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

export function InvoiceDetailsModal({ invoice, onClose }) {
  const t = useT();

  if (!invoice) return null;
  const typeStyle = PACKAGE_TYPE_STYLES[invoice.packageType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label="اغلاق"
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
          >
            <X size={18} />
          </button>
          <h3 className="flex-1 text-center text-lg font-bold text-ink">{t('dashboard.invoices.detailsTitle')}</h3>
          <span className="w-8" />
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="text-right text-sm font-bold text-primary">{t('dashboard.invoices.invoiceInfo')}</h4>
          <InfoRow icon={Hash} label={t('dashboard.invoices.invoiceNumber')} value={`#${invoice.id}`} />
          <InfoRow icon={CalendarDays} label={t('dashboard.invoices.issueDate')} value={invoice.issueDate} />
          <InfoRow icon={Clock} label={t('dashboard.invoices.paymentMethod')} value={invoice.paymentMethod} />

          <h4 className="mt-2 text-right text-sm font-bold text-primary">{t('dashboard.invoices.subscriptionInfo')}</h4>
          <InfoRow icon={FileText} label={t('dashboard.invoices.packageLabel')} value={invoice.packageTitle} />
          <InfoRow icon={LayoutGrid} label={t('dashboard.invoices.typeLabel')} value={typeStyle.label} />
          <InfoRow icon={User} label={t('dashboard.invoices.teacherLabel')} value={invoice.teacherName} />
          <InfoRow icon={BookOpen} label={t('dashboard.subjectLabel')} value={invoice.subject} />
          <InfoRow icon={ListOrdered} label={t('dashboard.myPackages.sessionsCount')} value={invoice.sessionsCount} />

          <h4 className="mt-2 text-right text-sm font-bold text-primary">{t('dashboard.invoices.amountDetails')}</h4>
          <InfoRow icon={CreditCard} label={t('dashboard.invoices.packagePrice')} value={`${invoice.price} $`} />
        </div>

        <button
          type="button"
          className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-medium text-white hover:bg-primary-hover"
        >
          {t('dashboard.invoices.download')}
        </button>
      </div>
    </div>
  );
}
