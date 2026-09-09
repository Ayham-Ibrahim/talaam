import { ArrowLeft } from 'lucide-react';
import { useT } from '@/hooks/useT';

/** شريط دعوة ختامي — يعيد استخدام hero-gradient (نفس تدرّج صفحتَي الدخول/التسجيل) بدل لون داكن مسطَّح، وزر بلون star الذهبي كتباين قوي — كله من هوية تعلّم القائمة */
export function TeacherFinalCta({ onBookClick }) {
  const t = useT();

  return (
    <div className="relative mt-10 overflow-hidden rounded-card bg-hero-gradient px-6 py-12 text-center shadow-lift sm:py-14">
      <div className="pointer-events-none absolute -top-10 left-1/4 h-56 w-56 rounded-full bg-white/20 blur-[100px]" />
      <h3 className="relative text-2xl font-extrabold text-white sm:text-3xl">{t('teacher.finalCta.title')}</h3>
      <p className="relative mx-auto mt-3 max-w-lg text-sm text-white/90 sm:text-base">{t('teacher.finalCta.subtitle')}</p>
      <button
        type="button"
        onClick={onBookClick}
        className="relative mt-6 inline-flex items-center gap-2 rounded-2xl bg-star px-9 py-3.5 text-base font-extrabold text-ink shadow-lift transition-transform duration-150 hover:-translate-y-0.5 hover:opacity-95"
      >
        {t('teacher.finalCta.button')}
        <ArrowLeft size={18} />
      </button>
    </div>
  );
}
