/** ألوان شارة الحضور — مشتركة بين لوحة الأدمن وتفاصيل الجلسة لدى المعلم */
export const ATTENDANCE_STYLES = {
  joined: { bg: '#F0FDF3', color: '#34C759' },
  notJoined: { bg: '#FDEFF2', color: '#B00852' },
  notJoinedYet: { bg: '#F2F2F7', color: '#6B7280' },
};

/** جلسات لم يكن الانضمام إليها متاحاً أصلاً — لا معنى لعرض حضور فيها */
export const NO_ATTENDANCE_STATUSES = ['cancelled', 'suspended'];

/**
 * الحضور مُشتق من سجل الانضمام (زر "انضم" عبر المنصة) فقط: دخل → حضر، لم يدخل وقد
 * انتهت الجلسة → لم يحضر، لم يدخل والجلسة جارية → لم يدخل بعد، قبل موعدها → null.
 */
export function attendanceState(scheduledAt, durationMin, log) {
  if (log) return 'joined';
  const startsAt = scheduledAt ? new Date(scheduledAt).getTime() : NaN;
  if (!Number.isFinite(startsAt) || Date.now() < startsAt) return null;
  return Date.now() > startsAt + (durationMin ?? 0) * 60_000 ? 'notJoined' : 'notJoinedYet';
}
