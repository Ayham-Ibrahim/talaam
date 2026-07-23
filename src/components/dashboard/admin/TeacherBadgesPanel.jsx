import { useState } from 'react';
import { X } from 'lucide-react';
import { formatDate } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

export function TeacherBadgesPanel({ awards, catalog, onGrant, onRevoke, isActing }) {
  const t = useT();
  const awardedBadgeIds = new Set(awards.map((a) => a.badgeId));
  const grantable = catalog.filter((b) => !awardedBadgeIds.has(b.id));
  const [selectedBadgeId, setSelectedBadgeId] = useState('');

  const handleGrant = () => {
    if (!selectedBadgeId) return;
    onGrant(Number(selectedBadgeId));
    setSelectedBadgeId('');
  };

  return (
    <div className="rounded-2xl border border-[#F2F2F7] bg-white p-5 shadow-card sm:p-6">
      <h3 className="text-right text-base font-bold text-ink">{t('dashboard.adminTeacherDetail.badgesTitle')}</h3>

      {awards.length === 0 ? (
        <p className="mt-3 text-right text-sm text-ink-soft">{t('dashboard.adminTeacherDetail.badgesEmpty')}</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {awards.map((award) => (
            <li
              key={award.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-[#FAFBFD] px-4 py-3"
            >
              <button
                type="button"
                disabled={isActing}
                onClick={() => onRevoke(award.id)}
                aria-label={t('dashboard.adminTeacherDetail.revokeBadge')}
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-line/60 hover:text-accent-pink disabled:opacity-50"
              >
                <X size={15} />
              </button>
              <div className="flex flex-1 items-center justify-end gap-2 text-right">
                <div>
                  <div className="text-sm font-semibold text-ink">{award.badge?.name}</div>
                  <div className="text-xs text-ink-soft">
                    {t('dashboard.adminTeacherDetail.awardedAt')} {formatDate(award.awardedAt)}
                  </div>
                </div>
                <span className="text-xl leading-none">{award.badge?.icon}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {grantable.length > 0 && (
        <div className="mt-4 flex items-center gap-2 border-t border-line/60 pt-4">
          <button
            type="button"
            disabled={isActing || !selectedBadgeId}
            onClick={handleGrant}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {t('dashboard.adminTeacherDetail.grantBadge')}
          </button>
          <select
            value={selectedBadgeId}
            onChange={(e) => setSelectedBadgeId(e.target.value)}
            className="flex-1 appearance-none rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none"
          >
            <option value="">—</option>
            {grantable.map((badge) => (
              <option key={badge.id} value={badge.id}>
                {badge.icon} {badge.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
