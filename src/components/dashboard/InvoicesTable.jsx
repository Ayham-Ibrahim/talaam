import { Download, Eye } from 'lucide-react';
import { Avatar } from '@/components/ui';
import { INVOICE_STATUS_STYLES, PACKAGE_TYPE_STYLES } from '@/mocks/dashboard.mock';
import { useT } from '@/hooks/useT';

export function InvoicesTable({ invoices, onView, onDownload }) {
  const t = useT();

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
      <table className="w-full min-w-[900px] text-sm">
        <thead>
          <tr className="border-b border-line">
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.invoices.invoiceNumber')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.invoices.issueDate')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.invoices.packageLabel')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.invoices.packageType')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.invoices.teacherCenter')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.invoices.amount')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.invoices.paymentStatus')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.invoices.action')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {invoices.map((invoice, i) => {
            const statusStyle = INVOICE_STATUS_STYLES[invoice.paymentStatus];
            const typeStyle = PACKAGE_TYPE_STYLES[invoice.packageType];
            return (
              <tr key={invoice.id} className={i % 2 === 1 ? 'bg-[#FAFBFD]' : ''}>
                <td className="px-4 py-4 text-right font-semibold text-ink">{invoice.id}</td>
                <td className="px-4 py-4 text-right text-ink-soft">{invoice.issueDate}</td>
                <td className="px-4 py-4 text-right text-ink-soft">{invoice.packageTitle}</td>
                <td className="px-4 py-4 text-right font-semibold" style={{ color: typeStyle.color }}>
                  {typeStyle.label}
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-ink-soft">{invoice.teacherName}</span>
                    <Avatar name={invoice.teacherName} src={invoice.teacherAvatar} size="sm" className="!h-9 !w-9" />
                  </div>
                </td>
                <td className="px-4 py-4 text-right font-semibold text-ink">{invoice.amount}$</td>
                <td className="px-4 py-4 text-right">
                  <span
                    className="rounded-pill px-4 py-1.5 text-xs font-bold text-white"
                    style={{ backgroundColor: statusStyle.color }}
                  >
                    {statusStyle.label}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => onView(invoice)}
                      className="text-primary hover:opacity-70"
                      aria-label={t('dashboard.invoices.view')}
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDownload(invoice)}
                      className="text-[#34C759] hover:opacity-70"
                      aria-label={t('dashboard.invoices.download')}
                    >
                      <Download size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
