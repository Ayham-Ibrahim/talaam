import { Star, GraduationCap, BookOpen, Users, Quote, Search, CalendarClock, Video, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TeacherCard, TeacherCardSkeleton } from '@/components/teacher/TeacherCard';
import { Card, Button, StarRating, Avatar, ErrorState } from '@/components/ui';
import { useFeaturedTeachers } from '@/hooks/useTeachers';
import { useStats as useStatsHook } from '@/hooks/useMeta';
import { formatCompact } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

/* ---------- Featured Teachers ---------- */
export function FeaturedTeachers() {
  const t = useT();
  const { data, isLoading, isError, refetch } = useFeaturedTeachers();

  return (
    <section className="container-app mt-14">
      <h2 className="text-center font-bold text-2xl text-ink mb-8">{t('home.topTeachers')}</h2>
      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <TeacherCardSkeleton key={i} />)
            : data.map((teacher) => <TeacherCard key={teacher.id} teacher={teacher} />)}
        </div>
      )}
    </section>
  );
}

/* ---------- Stats Band ---------- */
const STAT_ICONS = { star: Star, graduation: GraduationCap, book: BookOpen, users: Users };
const STAT_COLORS = {
  star: 'text-star bg-star/10',
  graduation: 'text-ink-soft bg-line/50',
  book: 'text-price bg-price/10',
  users: 'text-accent-pink bg-accent-pink/10',
};

export function StatsBand() {
  const { data, isLoading } = useStatsHook();

  return (
    <section className="container-app mt-14">
      <Card className="p-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {(isLoading ? Array.from({ length: 4 }) : data).map((stat, i) => {
            if (!stat) {
              return <div key={i} className="skeleton h-16 rounded-lg" />;
            }
            const Icon = STAT_ICONS[stat.icon] || Star;
            return (
              <div key={stat.key} className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${STAT_COLORS[stat.icon]}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-ink">{formatCompact(stat.value)}</div>
                  <div className="text-sm text-ink-soft">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </section>
  );
}

/* ---------- How It Works ---------- */
const STEP_ICONS = [Search, CalendarClock, Video, BarChart3];
const STEP_CONNECTOR_COLORS = ['#F74E28', '#6BCEEE', '#B00852'];

export function HowItWorks() {
  const t = useT();
  const steps = t('home.steps');

  return (
    <section className="container-app mt-20">
      <h2 className="text-center font-bold text-2xl text-ink">{t('home.howItWorksTitle')}</h2>
      <p className="text-center text-ink-soft text-sm mt-2 mb-12">{t('home.howItWorksSubtitle')}</p>

      <div className="relative mx-auto max-w-5xl">
        {/* Decorative dashed connectors */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
          fill="none"
        >
          {STEP_CONNECTOR_COLORS.map((color, i) => {
            const yStart = 12.5 + i * 25;
            const yEnd = yStart + 25;
            const xNear = i % 2 === 0 ? 46 : 54;
            const xFar = i % 2 === 0 ? 24 : 76;
            return (
              <path
                key={color}
                d={`M ${xNear} ${yStart} C ${xFar} ${yStart + 8}, ${xFar} ${yEnd - 8}, ${xNear} ${yEnd}`}
                stroke={color}
                strokeWidth="0.25"
                strokeDasharray="1.4 1.4"
              />
            );
          })}
        </svg>

        <div className="relative flex flex-col gap-10 lg:gap-14">
          {steps.map((step, i) => {
            const Icon = STEP_ICONS[i];
            const mirrored = i % 2 === 1;

            const circle = (
              <div className="relative z-10 flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.12)] lg:h-28 lg:w-28">
                <div className="flex h-[70%] w-[70%] items-center justify-center rounded-full bg-[#4B6898]">
                  <Icon className="text-white" size={28} />
                </div>
                <span
                  className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-[#4B6898] px-2.5 py-1 font-cairo text-xs font-bold text-white shadow-sm ${
                    mirrored ? '-right-2' : '-left-2'
                  }`}
                >
                  {step.no}
                </span>
              </div>
            );

            const title = (
              <h3 className="text-center text-base font-bold text-[#4B6898] sm:text-xl">{step.title}</h3>
            );
            const desc = (
              <p className="max-w-[240px] text-center text-sm text-[#2D2D2D] sm:text-base">{step.desc}</p>
            );
            const divider = <span className="h-12 w-px shrink-0 bg-line sm:h-16" />;

            const card = (
              <Card
                className={`flex flex-1 items-center justify-center gap-4 px-6 py-5 font-cairo sm:gap-6 sm:px-10 ${
                  mirrored ? '-mr-6' : '-ml-6'
                }`}
              >
                {mirrored ? (
                  <>
                    {title}
                    {divider}
                    {desc}
                  </>
                ) : (
                  <>
                    {desc}
                    {divider}
                    {title}
                  </>
                )}
              </Card>
            );

            return (
              <div key={step.no} className="flex">
                <div className={`flex w-full items-center lg:w-[58%] ${mirrored ? 'mr-auto' : 'ml-auto'}`}>
                  {mirrored ? (
                    <>
                      {card}
                      {circle}
                    </>
                  ) : (
                    <>
                      {circle}
                      {card}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- Testimonials ---------- */
export function Testimonials() {
  const t = useT();
  const testimonials = Array.from({ length: 3 }).map((_, i) => ({
    id: i,
    name: 'عبدالله سليم',
    role: 'طالب لغة انكليزية',
    rating: 4.9,
    text: 'منصة رائعة المعلم يشرح بطريقة سهلة ومبسطة والدعم والتواصل جيد انصح الجميع بتجربتها',
  }));

  return (
    <section className="container-app mt-20">
      <h2 className="text-center font-bold text-2xl text-ink mb-10">{t('home.testimonialsTitle')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {testimonials.map((item) => (
          <Card key={item.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <Quote className="text-accent-purple/30" size={28} />
            </div>
            <p className="text-sm text-ink-soft leading-relaxed mb-5">{item.text}</p>
            <div className="flex items-center justify-between">
              <StarRating value={item.rating} size={13} />
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-semibold text-ink">{item.name}</div>
                  <div className="text-xs text-ink-soft">{item.role}</div>
                </div>
                <Avatar name={item.name} size="sm" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

/* ---------- CTA ---------- */
export function CTASection() {
  const t = useT();
  const navigate = useNavigate();

  return (
    <section className="container-app mt-20">
      <div className="relative bg-primary rounded-card overflow-hidden px-8 py-12 lg:px-16 text-center">
        <div className="relative z-10">
          <h2 className="text-white font-bold text-2xl lg:text-3xl">{t('home.ctaTitle')}</h2>
          <p className="text-white/80 text-sm mt-3 mb-6">{t('home.ctaSubtitle')}</p>
          <Button variant="white" size="lg" onClick={() => navigate('/search')}>
            {t('home.ctaButton')}
          </Button>
        </div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-8 -mb-8" />
      </div>
    </section>
  );
}
