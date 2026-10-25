import { useT } from '@/hooks/useT';

/**
 * مثل useT لكن لصفحة بروفايل المعلم العامة: للمركز التدريبي يُفضَّل النص البديل
 * من centerProfile.* (نفس المسار بعد "teacher.") إن وُجد، وإلا يرجع للنص الأصلي.
 * باقي الأنواع لا تتأثر إطلاقاً.
 */
export function useProfileT(teacher) {
  const t = useT();
  const isCenter = teacher?.type === 'training_center';

  return function profileT(path) {
    if (isCenter && path.startsWith('teacher.')) {
      const centerPath = `centerProfile.${path.slice('teacher.'.length)}`;
      const override = t(centerPath);
      if (override !== centerPath) return override;
    }
    return t(path);
  };
}
