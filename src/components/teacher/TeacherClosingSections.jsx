import { Heart, Lightbulb, Quote } from "lucide-react";
import { useT } from "@/hooks/useT";

/** Same neon palette as the profile header — reused so the philosophy card reads as one visual family with it */
const NEON_GRADIENT = "linear-gradient(135deg, #060B24 0%, #0E1A4D 45%, #17237E 78%, #1B2E9C 100%)";
const RING_SHINE =
  "conic-gradient(from 0deg, transparent 0%, #38E0FF 12%, transparent 30%, transparent 60%, #8B7BFF 76%, transparent 92%)";

/** Icon circle with a spinning neon ring + soft glow, matching the header's photo treatment at a smaller scale */
function GlowIcon({ icon: Icon, size = 72 }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div className="absolute inset-[-5px] rounded-full motion-safe:animate-spin-slow" style={{ background: RING_SHINE }} />
      <div className="absolute inset-[3px] rounded-full bg-[#0E1A4D]" />
      <div className="absolute inset-[3px] flex items-center justify-center rounded-full bg-gradient-to-br from-[#2A3FBF] to-[#151F70] shadow-[0_0_22px_rgba(56,216,255,0.5)]">
        <Icon size={Math.round(size * 0.42)} className="text-[#5FE4FF]" strokeWidth={2} />
      </div>
    </div>
  );
}

/** "فلسفتي في التدريس" — same dark neon atmosphere as the hero header. Renders only with real content. */
function PhilosophyCard({ quote, text }) {
  const t = useT();
  if (!quote && !text) return null;

  return (
    <section
      className="relative overflow-hidden rounded-[28px] p-6 shadow-[0_8px_40px_rgba(15,23,90,0.35)] sm:p-8"
      style={{ background: NEON_GRADIENT }}
    >
      <div className="pointer-events-none absolute -top-16 right-10 h-56 w-56 rounded-full bg-[#5B4CFF]/30 blur-[80px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-48 w-48 rounded-full bg-[#00C2FF]/20 blur-[90px]" />

      <div className="relative z-10 flex items-start gap-4">
        <GlowIcon icon={Lightbulb} size={72} />
        <div className="flex-1 text-start">
          <h3 className="text-lg font-bold text-white sm:text-xl">{t("teacher.philosophyTitle")}</h3>
          <span className="mt-1.5 block h-1 w-10 rounded-full bg-[#5FE4FF]" />
        </div>
      </div>

      {quote && (
        <div className="relative z-10 mt-5 flex items-start gap-2 sm:mt-6">
          <Quote size={30} className="mt-1 shrink-0 -scale-x-100 text-[#5FE4FF]/40" />
          <p className="text-lg font-bold italic leading-[1.7] text-[#5FE4FF] sm:text-xl">{quote}</p>
        </div>
      )}

      {text && (
        <p className="relative z-10 mt-4 whitespace-pre-line text-[15px] leading-[1.9] text-white/75 sm:text-base">
          {text}
        </p>
      )}
    </section>
  );
}

/** "شكراً لزيارتك" — plain, background-free block; falls back to a two-sentence default when the teacher hasn't written one */
function ThankYouCard({ message }) {
  const t = useT();
  const custom = message?.trim();

  return (
    <section className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
      <div className="flex flex-1 items-start gap-4">
        <div className="mt-0.5 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-[0_8px_20px_rgba(59,89,152,0.35)]">
          <Heart size={24} className="fill-white" />
        </div>
        <div className="text-start text-[15px] font-semibold leading-[1.9] sm:text-base" style={{ color: "#3B5998" }}>
          {custom ? (
            <p>{custom}</p>
          ) : (
            <>
              <p>{t("teacher.defaultThankYouLine1")}</p>
              <p>{t("teacher.defaultThankYouLine2")}</p>
            </>
          )}
        </div>
      </div>

      {/* Decorative illustration — half the section's width, full PNG visible */}
      <div className="pointer-events-none w-1/2 shrink-0 sm:w-1/2">
        <img
          src="/laptop-illustration.png"
          alt=""
          aria-hidden="true"
          className="h-auto w-full object-contain"
          onError={(e) => {
            e.currentTarget.parentElement.style.display = "none";
          }}
        />
      </div>
    </section>
  );
}

export function TeacherClosingSections({ teacher }) {
  return (
    <div className="mt-6 flex flex-col gap-8">
      <PhilosophyCard quote={teacher.teachingPhilosophyQuote} text={teacher.teachingPhilosophyText} />
      <ThankYouCard message={teacher.thankYouMessage} />
    </div>
  );
}
