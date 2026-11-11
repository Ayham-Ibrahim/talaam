import { formatDateTime } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

/** معلومات الجلسة المُقيَّمة (الباقة، نوعها، رقم الجلسة، المعلم، المادة، التاريخ) — صفحة الطالب ولوحة الأدمن */
export function sessionQualityInfoRows(t, info, extra = []) {
  return [
    { key: 'package', value: info.packageTitle },
    { key: 'packageType', value: info.packageType ? t(`sessionQuality.packageTypes.${info.packageType}`) : null },
    { key: 'sessionNumber', value: info.sessionNumber },
    { key: 'teacher', value: info.teacherName },
    ...extra,
    { key: 'subject', value: info.subjectName },
    { key: 'sessionDate', value: info.sessionDate ? formatDateTime(info.sessionDate) : null },
  ];
}

export function SessionQualityInfo({ info, extra }) {
  const t = useT();
  return (
    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {sessionQualityInfoRows(t, info, extra).map((row) => (
        <div key={row.key} className="flex items-center justify-between gap-3 rounded-xl bg-[#F7F8FB] px-4 py-3 text-sm">
          <dt className="text-ink-soft">{t(`sessionQuality.info.${row.key}`)}</dt>
          <dd className="font-semibold text-ink">{row.value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  );
}
