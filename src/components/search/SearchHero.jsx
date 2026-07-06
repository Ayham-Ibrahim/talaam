import { School, GraduationCap, BookOpen } from 'lucide-react';
import { useT } from '@/hooks/useT';

const CATEGORY_ICONS = [School, GraduationCap, BookOpen];
const CATEGORY_TYPES = ['school', 'university', 'training'];

export function SearchHero({ activeType, onSelectType }) {
  const t = useT();
  const categories = t('search.categories');

  return (
    <div className="relative overflow-hidden rounded-card bg-[#7B70EE] px-8 py-10 shadow-soft sm:px-10">
      {/* Soft white glow behind the text */}
      <div className="absolute -left-16 top-2 h-64 w-[75%] max-w-md rounded-full bg-white/70 blur-[120px]" />

      {/* Hero illustration */}
      <img
        src="/search-hero-illustration.svg"
        alt=""
        className="pointer-events-none absolute -bottom-2 left-2 hidden w-56 sm:block lg:w-72"
      />

      <div className="relative z-10 max-w-lg font-cairo sm:ml-auto">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">{t('search.heroTitle')}</h2>
        <p className="mt-3 text-sm text-white/90 sm:text-base">{t('search.heroSubtitle')}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          {categories.map((label, i) => {
            const Icon = CATEGORY_ICONS[i];
            const type = CATEGORY_TYPES[i];
            const active = activeType === type;
            return (
              <button
                key={label}
                onClick={() => onSelectType(active ? null : type)}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-colors ${
                  active ? 'bg-white text-[#4B6898]' : 'bg-[#FAFAFA]/95 text-[#626262] hover:bg-white'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
