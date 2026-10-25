/**
 * Client-side, advisory conflict checks only — mirrors the backend's
 * ScheduleConflictService::assertNoConflict logic so the UI can warn BEFORE
 * submitting, but the binding check still happens server-side at booking
 * time (race conditions, e.g. another booking confirmed in the meantime,
 * are only caught there). Never treat a clean result here as a guarantee.
 */

/** True if [startA,endA) and [startB,endB) overlap. */
export function rangesOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

/**
 * Start instant of a calendar-session row. Prefers the raw `scheduledAt` ISO
 * instant (real API data, via mapCalendarSessionRow); falls back to
 * reconstructing it from the already-localized `date` + `time` ("hh:mm") +
 * `period` ("ص"/"م") fields, since mock fixtures (mockCalendarSessions) are
 * returned as-is without ever going through that mapper.
 */
function sessionStart(session) {
  if (session.scheduledAt) return new Date(session.scheduledAt);
  if (!session.date || !session.time) return null;
  const [h12, m] = session.time.split(':').map(Number);
  const hours = (h12 % 12) + (session.period === 'م' ? 12 : 0);
  const start = new Date(`${session.date}T00:00:00`);
  start.setHours(hours, m || 0, 0, 0);
  return start;
}

/**
 * Only a session still holding its time counts, same as the backend's
 * ScheduleConflictService: cancelled/no-show (mapped to 'cancelled') and
 * completed (mapped to 'attended') don't block, nor does any session whose
 * time has fully passed — it no longer occupies the schedule.
 */
function isLiveSession(s, sEnd) {
  if (s.status === 'cancelled' || s.status === 'attended') return false;
  return sEnd.getTime() > Date.now();
}

/**
 * First of `sessions` (calendar-session shaped, from
 * getCalendarSessions/getTeacherCalendarSessions) that overlaps [start, end).
 */
export function findOwnConflict(sessions, start, end) {
  if (!sessions?.length) return null;
  return (
    sessions.find((s) => {
      const sStart = sessionStart(s);
      if (!sStart) return false;
      const sEnd = new Date(sStart.getTime() + (s.durationMinutes ?? 0) * 60000);
      if (!isLiveSession(s, sEnd)) return false;
      return rangesOverlap(start, end, sStart, sEnd);
    }) ?? null
  );
}

/**
 * Same as findOwnConflict, but against a RECURRING weekly pattern (a
 * course's `schedules`: [{day_of_week, start_time, end_time}]) instead of
 * fixed dates — used for course enrollment, where sessions repeat every
 * week between the course's start/end date rather than being individually
 * dated like a group package's schedule.
 *
 * `courseId`: the course's own sessions (an earlier, still-pending enrollment
 * in it) aren't "another" session — skipped, as the backend excludes them too.
 */
export function findRecurringConflict(sessions, startDateISO, endDateISO, schedules, courseId = null) {
  if (!sessions?.length || !schedules?.length || !startDateISO || !endDateISO) return null;
  const rangeStart = new Date(startDateISO);
  const rangeEnd = new Date(endDateISO);
  rangeEnd.setHours(23, 59, 59, 999);

  return (
    sessions.find((s) => {
      if (courseId != null && Number(s.courseId) === Number(courseId)) return false;
      const sStart = sessionStart(s);
      if (!sStart || sStart < rangeStart || sStart > rangeEnd) return false;
      const sEnd = new Date(sStart.getTime() + (s.durationMinutes ?? 0) * 60000);
      if (!isLiveSession(s, sEnd)) return false;

      return schedules.some((sch) => {
        if (Number(sch.day_of_week) !== sStart.getDay() || !sch.start_time) return false;
        const [sh, sm] = sch.start_time.split(':').map(Number);
        const [eh, em] = (sch.end_time ?? sch.start_time).split(':').map(Number);
        const schStart = new Date(sStart);
        schStart.setHours(sh, sm, 0, 0);
        const schEnd = new Date(sStart);
        schEnd.setHours(eh, em, 0, 0);
        return rangesOverlap(sStart, sEnd, schStart, schEnd);
      });
    }) ?? null
  );
}
