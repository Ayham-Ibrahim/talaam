import { formatNumber } from '@/lib/formatters';

/** عناصر مشتركة لصفحات تقارير الأدمن (تقرير الطلاب، تقرير الموقع × المنهج) */

export const rowClass = (i) => (i % 2 === 1 ? 'bg-[#FAFBFD]' : '');
export const cell = 'px-4 py-3 text-ink-soft';
export const percentOf = (part, total) => (total ? Math.round((part / total) * 1000) / 10 : 0);

export function StatCard({ icon: Icon, label, value, hint, bg, color }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#F2F2F7] bg-white p-4 shadow-card">
      <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-xl" style={{ background: bg }}>
        <Icon size={28} style={{ color }} />
      </div>
      <div className="text-right">
        <div className="text-sm font-bold text-[#2D2D2D]">{label}</div>
        <div className="text-2xl font-bold text-[#2D2D2D]">{value}</div>
        {hint && <div className="text-xs text-ink-soft">{hint}</div>}
      </div>
    </div>
  );
}

/**
 * محاذاة موحّدة لكل جداول التقارير: العمود الأول (الاسم/الموقع) لليمين، وبقية الأعمدة في المنتصف —
 * العنوان وخلاياه معاً، فلا تتحدد المحاذاة في كل خلية على حدة.
 */
export function Table({ columns, minWidth, children }) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
      <table
        className="w-full text-sm [&_td:first-child]:text-right [&_td]:text-center [&_th:first-child]:text-right [&_th]:text-center"
        style={{ minWidth }}
      >
        <thead>
          <tr className="border-b border-line">
            {columns.map((col, i) => (
              <th key={i} className="whitespace-nowrap px-4 py-3 font-bold text-ink">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

/** format: منسّق الرقم — formatNumber افتراضياً، وتقرير التسويق يمرّر formatLatinNumber */
export function ShareBar({ value, color = '#2F80ED', format = formatNumber }) {
  return (
    <div className="inline-flex items-center gap-2 align-middle">
      <div className="h-2 w-28 overflow-hidden rounded-full bg-line/60">
        <div className="h-full rounded-full" style={{ width: `${Math.min(value, 100)}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold text-ink">{format(value)}%</span>
    </div>
  );
}
