import { Link } from 'react-router-dom';
import { ChevronLeft, PartyPopper } from 'lucide-react';
import { Avatar } from '@/components/ui';
import { TEACHER_TYPE_LABELS } from '@/mocks/admin.mock';
import { formatDate } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

export function PendingVerificationsCard({ teachers }) {
  const t = useT();

  return (
    <div className="rounded-2xl border border-[#F2F2F7] bg-white p-5 shadow-card sm:p-6">
      <h2 className="text-right text-lg font-bold text-ink">{t('dashboard.adminOverview.attentionTitle')}</h2>

      {teachers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <PartyPopper className="text-success" size={28} />
          <p className="text-sm text-ink-soft">{t('dashboard.adminOverview.attentionEmpty')}</p>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col divide-y divide-line">
          {teachers.map((teacher) => (
            <li key={teacher.id} className="flex items-center justify-between gap-3 py-3">
              <Link
                to={`/dashboard/admin/teachers/${teacher.id}`}
                className="flex items-center gap-2 rounded-pill bg-primary-light px-4 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-white"
              >
                {t('dashboard.adminOverview.review')}
                <ChevronLeft size={14} />
              </Link>

              <div className="flex flex-1 items-center justify-end gap-3 text-right">
                <div>
                  <div className="font-semibold text-ink">{teacher.name}</div>
                  <div className="text-xs text-ink-soft">
                    {TEACHER_TYPE_LABELS[teacher.type]} · {t('dashboard.adminOverview.attentionSubmittedAt')} {formatDate(teacher.submittedAt)}
                  </div>
                </div>
                <Avatar name={teacher.name} src={teacher.avatar} size="sm" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
