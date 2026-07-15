import { Link } from "react-router-dom";
import { Heart, GraduationCap } from "lucide-react";
import { Card, Avatar, StarRating, Button } from "@/components/ui";
import { useT } from "@/hooks/useT";

const EDUCATION_LABELS = {
  school: "التعليم المدرسي",
  university: "التعليم الجامعي",
  training: "الدورات التدريبية",
};

export function FavoriteTeacherRow({ teacher, onRemove }) {
  const t = useT();

  return (
    <Card className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-6 animate-fade-in">
      {/* Photo + name/stats — renders at the row start (right, since the page is RTL) */}
      <div className="flex items-center gap-4">
        <div className="w-[105px] h-[105px] rounded-2xl overflow-hidden bg-accent-purple/10 flex items-center justify-center shrink-0">
          {teacher.avatar ? (
            <img
              src={teacher.avatar}
              alt={teacher.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Avatar
              name={teacher.name}
              size="xl"
              className="!rounded-none w-full h-full text-3xl"
            />
          )}
        </div>
        <div className="text-right">
          <h3 className="font-bold text-ink text-lg">{teacher.name}</h3>
          <p className="text-ink-soft mt-0.5">{teacher.typeLabel}</p>
          <div className="flex items-center gap-3 mt-1.5 text-sm text-ink-soft">
            <StarRating value={teacher.rating} size={14} />
            <span>{teacher.studentsCount} طالب</span>
          </div>
        </div>
      </div>

      {/* Education badge + subject tags + actions */}
      <div className="flex flex-col items-start gap-2  min-w-[240px]">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          {EDUCATION_LABELS[teacher.type] ?? teacher.stageLabel}
          <GraduationCap size={18} />
        </span>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {teacher.subjects.slice(0, 4).map((subject) => (
            <span
              key={subject}
              className="text-xs text-ink bg-canvas rounded-pill px-3 py-2"
            >
              {subject}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <Link to={`/teacher/${teacher.id}`}>
            <Button variant="outline" size="sm">
              {t("favorites.profile")}
            </Button>
          </Link>
          <Link to={`/teacher/${teacher.id}`}>
            <Button size="sm">{t("favorites.bookNow")}</Button>
          </Link>
        </div>
      </div>

      {/* Remove from favorites — renders at row end (left) */}
      <button
        onClick={() => onRemove(teacher.id)}
        className="flex flex-col items-center gap-1.5 shrink-0 text-ink hover:opacity-80 transition-opacity"
      >
        <Heart size={28} className="fill-accent-pink text-accent-pink" />
        <span className="text-sm font-semibold">{t("favorites.remove")}</span>
      </button>
    </Card>
  );
}
