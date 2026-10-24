import {
  BookOpen,
  CalendarCheck,
  GraduationCap,
  Landmark,
  Languages as LanguagesIcon,
  MessageCircle,
  ShieldCheck,
  Star,
  Video,
} from 'lucide-react';
import { useT } from '@/hooks/useT';
import { QUALIFICATION_LABELS, EXPERIENCE_LABELS } from '@/services/teacherService';

/** نفس تدرّج/تصميم TeacherProfileHeader.jsx حرفياً — بلا شارة توثيق/تقييم/مفضّلة (لا تنطبق على الداعم الأكاديمي). */
const NEON_GRADIENT = 'linear-gradient(135deg, #060B24 0%, #0E1A4D 45%, #17237E 78%, #1B2E9C 100%)';
const RING_SHINE = 'conic-gradient(from 0deg, transparent 0%, #38E0FF 12%, transparent 30%, transparent 60%, #8B7BFF 76%, transparent 92%)';

function FloatingIcon({ Icon, style, delay, size = 40 }) {
  return (
    <div
      className="absolute flex items-center justify-center rounded-full bg-gradient-to-br from-[#3AD8FF] to-[#6C63FF] shadow-[0_0_18px_rgba(56,216,255,0.65)] motion-safe:animate-float"
      style={{ width: size, height: size, animationDelay: `${delay}s`, ...style }}
    >
      <Icon size={size * 0.45} className="text-white" strokeWidth={2} />
    </div>
  );
}

const FLOATING_ICONS = [
  { Icon: GraduationCap, style: { left: '48%', top: '-6%' }, delay: 0, size: 44 },
  { Icon: Video, style: { left: '88%', top: '6%' }, delay: 0.6, size: 40 },
  { Icon: Star, style: { left: '98%', top: '42%' }, delay: 1.2, size: 36 },
  { Icon: MessageCircle, style: { left: '86%', top: '80%' }, delay: 1.8, size: 38 },
  { Icon: BookOpen, style: { left: '46%', top: '96%' }, delay: 0.9, size: 42 },
  { Icon: Landmark, style: { left: '6%', top: '80%' }, delay: 1.5, size: 36 },
  { Icon: ShieldCheck, style: { left: '-6%', top: '40%' }, delay: 0.3, size: 40 },
  { Icon: CalendarCheck, style: { left: '8%', top: '6%' }, delay: 2.1, size: 36 },
];

export function AcademicSupporterProfileHeader({ supporter }) {
  const t = useT();

  const bullets = [
    supporter.qualification && {
      icon: GraduationCap,
      label: t('academicSupporter.settings.qualificationLabel'),
      value: QUALIFICATION_LABELS[supporter.qualification] ?? supporter.qualification,
    },
    supporter.experienceYears && {
      icon: CalendarCheck,
      label: t('academicSupporter.settings.experienceLabel'),
      value: EXPERIENCE_LABELS[supporter.experienceYears] ?? supporter.experienceYears,
    },
    supporter.university?.name && {
      icon: Landmark,
      label: t('completeProfile.universityLabel'),
      value: supporter.university.name,
    },
    supporter.major?.name && {
      icon: BookOpen,
      label: t('completeProfile.majorLabel'),
      value: supporter.major.name,
    },
  ].filter(Boolean);

  return (
    <div className="relative overflow-hidden rounded-[28px] shadow-[0_8px_40px_rgba(15,23,90,0.35)]" style={{ background: NEON_GRADIENT }}>
      <div className="pointer-events-none absolute -top-16 right-10 h-64 w-64 rounded-full bg-[#5B4CFF]/30 blur-[80px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-[#00C2FF]/20 blur-[90px]" />
      <div className="pointer-events-none absolute -left-16 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-white/25 blur-[70px] motion-safe:animate-flare-pulse" />

      <div className="relative z-10 flex flex-col items-stretch gap-8 p-6 pb-9 sm:p-10 sm:pb-12 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        <div className="flex flex-1 flex-col items-start gap-4 text-start">
          <div>
            <h1 className="text-[28px] font-bold leading-tight text-white sm:text-[36px]">{supporter.name}</h1>

            {supporter.languages?.length > 0 && (
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                {supporter.languages.map((l) => (
                  <span
                    key={l.code}
                    className="flex items-center gap-1 rounded-pill bg-white/10 px-3 py-1 text-xs font-medium text-white/85 ring-1 ring-white/20"
                  >
                    <LanguagesIcon size={12} />
                    {l.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {bullets.length > 0 && (
            <div className="mt-1 grid grid-cols-2 gap-x-6 gap-y-4 sm:flex sm:flex-wrap sm:gap-x-8">
              {bullets.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#5FE4FF] ring-1 ring-white/20">
                    <Icon size={18} strokeWidth={2} />
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span className="text-sm font-bold text-white">{value}</span>
                    <span className="text-xs text-white/60">{label}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative mx-auto h-[220px] w-[220px] shrink-0 sm:h-[260px] sm:w-[260px] lg:mx-0 lg:me-6">
          <div className="absolute inset-[-14px] rounded-full bg-[#38E0FF]/25 blur-3xl motion-safe:animate-glow-pulse" />

          <div className="absolute inset-0 hidden sm:block">
            {FLOATING_ICONS.map((f, i) => (
              <FloatingIcon key={i} {...f} />
            ))}
          </div>

          <div className="absolute inset-0 rounded-full motion-safe:animate-spin-slow" style={{ background: RING_SHINE }} />
          <div className="absolute inset-[6px] rounded-full bg-white/90" />
          <div className="absolute inset-[10px] overflow-hidden rounded-full">
            <img
              src={supporter.avatar || '/teacher.webp'}
              alt={supporter.name}
              decoding="async"
              className="h-full w-full object-cover object-top"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
