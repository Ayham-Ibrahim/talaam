import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { Avatar } from '@/components/ui';
import { TeacherStatusBadge } from './TeacherStatusBadge';
import { TEACHER_TYPE_LABELS } from '@/mocks/admin.mock';
import { formatDate } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

export function AdminTeachersTable({ teachers }) {
  const t = useT();

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b border-line">
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminTeachers.colTeacher')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminTeachers.colType')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminTeachers.colStatus')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminTeachers.colSubmitted')}</th>
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.adminTeachers.colActions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {teachers.map((teacher, i) => (
            <tr key={teacher.id} className={i % 2 === 1 ? 'bg-[#FAFBFD]' : ''}>
              <td className="px-4 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="text-right">
                    <div className="font-semibold text-ink">{teacher.name}</div>
                    <div className="text-xs text-ink-soft" dir="ltr">
                      {teacher.email}
                    </div>
                  </div>
                  <Avatar name={teacher.name} src={teacher.avatar} size="sm" className="!h-9 !w-9" />
                </div>
              </td>
              <td className="px-4 py-4 text-right text-ink-soft">{TEACHER_TYPE_LABELS[teacher.type]}</td>
              <td className="px-4 py-4 text-right">
                <TeacherStatusBadge status={teacher.status} />
              </td>
              <td className="px-4 py-4 text-right text-ink-soft">{formatDate(teacher.submittedAt)}</td>
              <td className="px-4 py-4 text-right">
                <Link
                  to={`/dashboard/admin/teachers/${teacher.id}`}
                  className="inline-flex items-center gap-1.5 text-primary hover:opacity-70"
                >
                  <Eye size={18} />
                  {t('dashboard.adminTeachers.view')}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
