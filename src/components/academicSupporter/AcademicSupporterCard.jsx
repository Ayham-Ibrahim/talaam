import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { Avatar, Skeleton } from '@/components/ui';
import { QUALIFICATION_LABELS, EXPERIENCE_LABELS_SHORT } from '@/services/teacherService';
import { useT } from '@/hooks/useT';

export function AcademicSupporterCard({ supporter }) {
  const t = useT();
  const qualificationLabel = supporter.qualification ? QUALIFICATION_LABELS[supporter.qualification] : null;
  const experienceLabel = supporter.experienceYears ? EXPERIENCE_LABELS_SHORT[supporter.experienceYears] : null;

  return (
    <Link
      to={`/dashboard/student/academic-support/${supporter.id}`}
      className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-card transition-shadow hover:shadow-lift"
    >
      <div className="flex items-center gap-3">
        <Avatar name={supporter.name} src={supporter.avatar} size="md" />
        <div className="text-right">
          <div className="font-bold text-ink">{supporter.name}</div>
          {(qualificationLabel || experienceLabel) && (
            <div className="text-xs text-ink-soft">{[qualificationLabel, experienceLabel].filter(Boolean).join(' · ')}</div>
          )}
        </div>
      </div>

      {supporter.bio && <p className="line-clamp-2 text-right text-sm text-ink-soft">{supporter.bio}</p>}

      {supporter.subjects?.length > 0 && (
        <div className="flex flex-wrap justify-end gap-1.5">
          {supporter.subjects.slice(0, 4).map((s) => (
            <span key={s.id} className="flex items-center gap-1 rounded-pill bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <GraduationCap size={12} />
              {s.name}
            </span>
          ))}
        </div>
      )}

      <span className="mt-auto text-start text-sm font-bold text-primary">{t('academicSupporter.browse.viewProfile')}</span>
    </Link>
  );
}

export function AcademicSupporterCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-card">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3 rounded" />
          <Skeleton className="h-3 w-1/2 rounded" />
        </div>
      </div>
      <Skeleton className="h-10 rounded" />
    </div>
  );
}
