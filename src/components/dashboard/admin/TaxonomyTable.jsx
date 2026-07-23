import { Pencil, Trash2 } from 'lucide-react';
import { EDUCATION_TYPE_LABELS } from '@/mocks/adminTaxonomy.mock';
import { useT } from '@/hooks/useT';

export function TaxonomyTable({ items, typeConfig, onEdit, onDelete }) {
  const t = useT();

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="border-b border-line">
            {typeConfig.hasCode && <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminTaxonomy.colCode')}</th>}
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminTaxonomy.colName')}</th>
            {typeConfig.hasEducationType && (
              <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminTaxonomy.colEducationType')}</th>
            )}
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminTaxonomy.colActions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.map((item, i) => (
            <tr key={item.id} className={i % 2 === 1 ? 'bg-[#FAFBFD]' : ''}>
              {typeConfig.hasCode && <td className="px-4 py-4 text-right text-ink-soft" dir="ltr">{item.code}</td>}
              <td className="px-4 py-4 text-right font-semibold text-ink">{item.name_ar}</td>
              {typeConfig.hasEducationType && (
                <td className="px-4 py-4 text-right text-ink-soft">{EDUCATION_TYPE_LABELS[item.education_type] ?? '—'}</td>
              )}
              <td className="px-4 py-4 text-right">
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    className="text-primary hover:opacity-70"
                    aria-label={t('dashboard.adminTaxonomy.edit')}
                  >
                    <Pencil size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    className="text-accent-pink hover:opacity-70"
                    aria-label={t('dashboard.adminTaxonomy.delete')}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
