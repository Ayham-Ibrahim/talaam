import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { Avatar } from '@/components/ui';
import { ChangeStudentPasswordModal } from './ChangeStudentPasswordModal';
import { formatDate } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

function EducationTypeBadge({ type }) {
  const t = useT();
  if (!type) return <span className="text-ink-soft">{t('dashboard.adminStudents.noEducationType')}</span>;
  return <span className="text-ink-soft">{t(`dashboard.adminStudents.educationType.${type}`)}</span>;
}

function ActiveBadge({ isActive }) {
  const t = useT();
  return (
    <span
      className={`inline-flex items-center rounded-pill px-3 py-1 text-xs font-bold ${
        isActive ? 'bg-success-light text-success' : 'bg-accent-pink/10 text-accent-pink'
      }`}
    >
      {t(isActive ? 'dashboard.adminStudents.active' : 'dashboard.adminStudents.inactive')}
    </span>
  );
}

export function AdminStudentsTable({ students }) {
  const t = useT();
  const [passwordModalStudent, setPasswordModalStudent] = useState(null);

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="border-b border-line">
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminStudents.colStudent')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminStudents.colPhone')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminStudents.colEducationType')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminStudents.colStatus')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminStudents.colJoined')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminStudents.colActions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {students.map((student, i) => (
            <tr key={student.id} className={i % 2 === 1 ? 'bg-[#FAFBFD]' : ''}>
              <td className="px-4 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Avatar name={student.name} src={student.avatar} size="sm" className="!h-9 !w-9" />
                  <div className="text-right">
                    <div className="font-semibold text-ink">{student.name}</div>
                    <div className="text-xs text-ink-soft" dir="ltr">
                      {student.email}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-right text-ink-soft" dir="ltr">
                {student.phone || '—'}
              </td>
              <td className="px-4 py-4 text-right">
                <EducationTypeBadge type={student.educationType} />
              </td>
              <td className="px-4 py-4 text-right">
                <ActiveBadge isActive={student.isActive} />
              </td>
              <td className="px-4 py-4 text-right text-ink-soft">{formatDate(student.createdAt)}</td>
              <td className="px-4 py-4 text-right">
                <button
                  type="button"
                  onClick={() => setPasswordModalStudent(student)}
                  className="inline-flex items-center gap-1.5 text-primary hover:opacity-70"
                >
                  <KeyRound size={16} />
                  {t('dashboard.adminStudents.changePassword')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {passwordModalStudent && (
        <ChangeStudentPasswordModal student={passwordModalStudent} onClose={() => setPasswordModalStudent(null)} />
      )}
    </div>
  );
}
