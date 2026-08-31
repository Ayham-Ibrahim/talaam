/** Maps CreatePackageRequest/UpdatePackageRequest field paths to readable labels. */
const PACKAGE_FIELD_LABELS = {
  title: 'العنوان',
  subject_id: 'المادة',
  session_format: 'نوع الجلسات',
  capacity: 'السعة',
  curriculum_ids: 'المناهج',
  stage_ids: 'المراحل',
  grades: 'الصفوف',
  sessions_count: 'عدد الجلسات',
  discount_percent: 'نسبة الخصم',
  description: 'الوصف',
  schedules: 'الجدولة',
  teacher_price: 'السعر',
  status: 'حالة الباقة',
};

const SCHEDULE_SUBFIELD_LABELS = { day_of_week: 'اليوم', date: 'التاريخ', start_time: 'وقت البدء' };

export function packageErrorLabel(path) {
  if (PACKAGE_FIELD_LABELS[path]) return PACKAGE_FIELD_LABELS[path];

  const scheduleMatch = path.match(/^schedules\.(\d+)(?:\.(.+))?$/);
  if (scheduleMatch) {
    const [, index, sub] = scheduleMatch;
    return `الجدولة #${Number(index) + 1}${sub ? ` - ${SCHEDULE_SUBFIELD_LABELS[sub] ?? sub}` : ''}`;
  }

  const curriculumMatch = path.match(/^curriculum_ids\.(\d+)$/);
  if (curriculumMatch) return `المناهج #${Number(curriculumMatch[1]) + 1}`;

  const stageMatch = path.match(/^stage_ids\.(\d+)$/);
  if (stageMatch) return `المراحل #${Number(stageMatch[1]) + 1}`;

  const gradeMatch = path.match(/^grades\.(\d+)$/);
  if (gradeMatch) return `الصفوف #${Number(gradeMatch[1]) + 1}`;

  return path;
}

/** المفاتيح التي تُعرض بالفعل كإطار أحمر + رسالة أسفل حقلها مباشرة في خطوات المعالج — لا داعٍ لتكرارها ضمن القائمة العامة */
export const PACKAGE_FIELDS_WITH_INLINE_ERRORS = new Set(['title', 'description', 'subject_id', 'capacity', 'sessions_count', 'teacher_price']);

export function isScheduleErrorKey(key) {
  return key === 'schedules' || key.startsWith('schedules.');
}
