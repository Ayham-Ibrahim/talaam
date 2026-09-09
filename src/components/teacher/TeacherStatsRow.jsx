import { MapPin, Briefcase, Users, Star, CalendarCheck } from 'lucide-react';
import { formatNumber } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

// نفس تدوير الألوان المستخدَم في بطاقات الباقات (PackagesSection) — هوية واحدة عبر الصفحة
const STAT_ACCENTS = [
  { bg: '#E3F1FD', solid: '#2F80ED' },
  { bg: '#FDEAE3', solid: '#F74E28' },
  { bg: '#E3F5EC', solid: '#2E9E6B' },
  { bg: '#FDF3E3', solid: '#F5A623' },
  { bg: '#F7E6EE', solid: '#B00852' },
];

/**
 * صف إحصائيات مستقل تحت البانر مباشرة (لم يعد مدمجاً بداخل TeacherAboutSection)
 * — كل القيم حقيقية (بلد/خبرة/طلاب/تقييم من PublicTeacherResource.stats)
 * ما عدا "الحصص المكتملة": لا يوجد عمود حقيقي لعدد الحصص الإجمالي المكتمل
 * لكل معلم في الباك اند بعد، فبقيت وهمية مؤقتاً (نفس حال avg_response_minutes).
 */
export function TeacherStatsRow({ teacher }) {
  const t = useT();

  const stats = [
    { icon: MapPin, value: teacher.city || '—', label: t('teacher.stats.countryLabel') },
    { icon: Briefcase, value: teacher.experienceLabel || '—', label: t('teacher.stats.experienceLabel') },
    { icon: Users, value: formatNumber(teacher.studentsCount ?? 0), label: t('teacher.stats.studentsLabel') },
    { icon: Star, value: teacher.rating || '—', label: t('teacher.stats.ratingLabel') },
    { icon: CalendarCheck, value: t('teacher.stats.completedSessionsFake'), label: t('teacher.stats.completedSessionsLabel') },
  ];

  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((s, i) => {
        const accent = STAT_ACCENTS[i % STAT_ACCENTS.length];
        return (
          <div
            key={i}
            className="flex flex-col items-center gap-2 rounded-2xl border border-line/60 bg-white p-4 text-center shadow-card transition-transform duration-200 hover:-translate-y-0.5"
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: accent.bg }}
            >
              <s.icon size={18} style={{ color: accent.solid }} />
            </span>
            <span className="text-lg font-extrabold text-ink">{s.value}</span>
            <span className="text-xs text-ink-soft">{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}
