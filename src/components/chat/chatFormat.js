const timeFormat = new Intl.DateTimeFormat('ar', { hour: 'numeric', minute: '2-digit' });
const shortDateFormat = new Intl.DateTimeFormat('ar', { day: 'numeric', month: 'short' });
const dayFormat = new Intl.DateTimeFormat('ar', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** وقت الرسالة؛ وفي قائمة المحادثات تاريخ قصير لما قبل اليوم */
export function formatMessageTime(iso, compact = false) {
  const date = new Date(iso);
  if (compact && !isSameDay(date, new Date())) return shortDateFormat.format(date);
  return timeFormat.format(date);
}

export function dayKey(iso) {
  const date = new Date(iso);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function formatDayLabel(iso, t) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(date, today)) return t('chat.today');
  if (isSameDay(date, yesterday)) return t('chat.yesterday');
  return dayFormat.format(date);
}
