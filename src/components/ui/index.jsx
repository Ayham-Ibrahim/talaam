import { Star, Heart, ImageOff } from "lucide-react";
import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

/* ---------- Animated Counter ---------- */
export function Counter({ from = 0, to, duration = 1.5, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    if (inView) {
      animate(count, to, { duration, ease: [0.16, 1, 0.3, 1] });
    }
  }, [inView, count, to, duration]);

  return <motion.span ref={ref} className={className}>{rounded}</motion.span>;
}

/* ---------- Button ---------- */
export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover shadow-[0_2px_8px_rgba(59,89,152,0.2)]",
    outline: "border border-primary text-primary hover:bg-primary/5",
    ghost: "text-ink-soft hover:bg-line/50",
    white: "bg-white text-primary hover:bg-white/90 shadow-soft",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3 text-base",
  };
  return (
    <motion.button
      whileHover={{ y: -1, scale: 1.01, boxShadow: variant === "primary" ? "0 4px 12px rgba(59,89,152,0.25)" : undefined }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className={`inline-flex items-center justify-center gap-2 rounded-btn font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/* ---------- Card ---------- */
export function Card({ children, className = "", ...props }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01, boxShadow: "0 12px 24px rgba(0,0,0,0.06)" }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={`bg-surface rounded-card shadow-card transition-shadow duration-300 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Badge (verified) ---------- */
export function VerifiedBadge({ label = "معلم معتمد", className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 bg-success-light text-success text-[11px] font-medium px-2.5 py-1 rounded-pill ${className}`}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2l2.4 2.4 3.3-.6.6 3.3L21 12l-2.7 2.9-.6 3.3-3.3-.6L12 22l-2.4-2.4-3.3.6-.6-3.3L3 12l2.7-2.9.6-3.3 3.3.6L12 2z" />
        <path d="M10.5 14.5l-2-2 1-1 1 1 3-3 1 1z" fill="#fff" />
      </svg>
      {label}
    </span>
  );
}

/* ---------- Pill ---------- */
export function Pill({ children, active = false, dot, icon, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[13px] px-3.5 py-1.5 rounded-pill border transition-colors ${
        active
          ? "bg-primary text-white border-primary"
          : "bg-canvas text-ink-soft border-line"
      } ${className}`}
    >
      {icon ? (
        <span className="flex shrink-0 items-center justify-center leading-none">{icon}</span>
      ) : (
        dot && (
          <span
            className="w-3 h-3 shrink-0 rounded-full"
            style={{ background: dot }}
          />
        )
      )}
      {children}
    </span>
  );
}

/* ---------- Avatar ---------- */
export function Avatar({ src, name = "", size = "md", className = "" }) {
  const sizes = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20",
    xl: "w-28 h-28",
  };
  const initials = name
    .replace(/^[أا]\.\s*/, "")
    .trim()
    .charAt(0);
  return (
    <div
      className={`${sizes[size]} rounded-xl overflow-hidden flex items-center justify-center bg-accent-purple/10 text-accent-purple font-semibold shrink-0 ${className}`}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-lg">{initials || <ImageOff size={20} />}</span>
      )}
    </div>
  );
}

/* ---------- StarRating ---------- */
export function StarRating({
  value = 0,
  showValue = true,
  size = 14,
  className = "",
}) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {showValue && (
        <span className="text-sm font-semibold text-ink">{value}</span>
      )}
      <Star size={size} className="fill-star text-star" />
    </span>
  );
}

/* ---------- FavoriteButton ---------- */
export function FavoriteButton({ active = false, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      aria-label="المفضلة"
      className={`w-11 h-11 rounded-full bg-white/90 shadow-sm flex items-center justify-center transition-transform hover:scale-110 ${className}`}
    >
      <Heart
        size={16}
        className={
          active ? "fill-accent-pink text-accent-pink" : "text-ink-soft"
        }
      />
    </button>
  );
}

/* ---------- PriceTag ---------- */
export function PriceTag({
  amount,
  suffix = "",
  currency = "USD",
  className = "",
}) {
  const symbol = currency === "USD" ? "$" : currency;
  return (
    <span className={`text-price font-bold ${className}`}>
      {symbol}
      {amount}
      {suffix && <span className="text-sm font-medium"> {suffix}</span>}
    </span>
  );
}

/* ---------- Skeleton ---------- */
export function Skeleton({ className = "" }) {
  return <div className={`skeleton ${className}`} />;
}

/* ---------- EmptyState ---------- */
export function EmptyState({
  title = "لا توجد نتائج",
  hint = "",
  action = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-line/40 flex items-center justify-center mb-4">
        <ImageOff className="text-ink-soft" size={28} />
      </div>
      <p className="text-lg font-semibold text-ink">{title}</p>
      {hint && <p className="text-sm text-ink-soft mt-1">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ---------- ErrorState ---------- */
export function ErrorState({ message = "حدث خطأ ما", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-ink font-semibold">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          إعادة المحاولة
        </Button>
      )}
    </div>
  );
}
