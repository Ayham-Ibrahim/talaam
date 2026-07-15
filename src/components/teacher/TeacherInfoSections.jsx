import { Pill } from "@/components/ui";

// Drawn from the app's own identity palette (accent-pink, primary, star, accent-purple, success, price)
const IDENTITY_DOT_COLORS = ["#C2185B", "#4B6898", "#F5A623", "#7E57C2", "#2E9E6B", "#2F80ED"];

export function InfoSection({ title, items = [], colorfulDots = false }) {
  if (!items.length) return null;

  return (
    <div className="mt-6 rounded-2xl bg-white p-5 shadow-card">
      <h3 className="mb-3 text-right font-bold text-ink">{title}</h3>
      <div className="flex flex-wrap justify-start gap-2">
        {items.map((item, i) => {
          const isObject = typeof item === "object" && item !== null;
          const label = isObject ? item.label : item;
          const flag = isObject ? item.flag : null;
          return (
            <Pill
              key={label}
              icon={flag}
              dot={flag ? null : colorfulDots ? IDENTITY_DOT_COLORS[i % IDENTITY_DOT_COLORS.length] : "#C7D0DF"}
            >
              {label}
            </Pill>
          );
        })}
      </div>
    </div>
  );
}
