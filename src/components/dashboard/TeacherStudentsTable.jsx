import { useNavigate } from 'react-router-dom';
import { TEACHER_SESSION_TYPE_STYLES } from '@/mocks/teacherDashboard.mock';
import { useT } from '@/hooks/useT';

export function TeacherStudentsTable({ students }) {
  const t = useT();
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
      <table className="w-full min-w-[900px] text-sm">
        <thead>
          <tr className="border-b border-line">
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.teacherStudents.student')}</th>
            <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.teacherStudents.package')}</th>
            <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.teacherStudents.type')}</th>
            <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.teacherStudents.subject')}</th>
            <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.teacherStudents.nextSession')}</th>
            <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.teacherStudents.time')}</th>
            <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.teacherStudents.action')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {students.map((student, i) => {
            const typeStyle = TEACHER_SESSION_TYPE_STYLES[student.type];
            return (
              <tr key={student.id} className={i % 2 === 1 ? 'bg-[#F7F8FD]' : ''}>
                <td className="px-4 py-4 text-right font-semibold text-ink">{student.studentName}</td>
                <td className="px-4 py-4 text-center text-ink-soft">{student.packageTitle}</td>
                <td className="px-4 py-4 text-center font-semibold" style={{ color: typeStyle?.color }}>
                  {typeStyle?.label}
                </td>
                <td className="px-4 py-4 text-center text-ink-soft">{student.subject}</td>
                <td className="px-4 py-4 text-center text-ink">
                  <div className="font-semibold">{student.nextSessionDay}</div>
                  <div className="text-ink-soft">{student.nextSessionDate}</div>
                </td>
                <td className="px-4 py-4 text-center font-semibold text-ink">{student.time}</td>
                <td className="px-4 py-4 text-center">
                  <button
                    type="button"
                    onClick={() => navigate(`/dashboard/teacher/students/${student.id}`)}
                    className="rounded-xl border border-primary bg-[#EDF0F5] px-4 py-2 text-xs font-medium text-primary hover:bg-primary/10"
                  >
                    {t('dashboard.teacherStudents.details')}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
