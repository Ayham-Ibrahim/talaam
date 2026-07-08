import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Search,
  ShieldCheck,
  Video,
  Clock,
  Headphones,
  CheckCircle2,
} from "lucide-react";
import { useT } from "@/hooks/useT";

export function Hero() {
  const t = useT();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const featureIcons = [ShieldCheck, Video, Clock, Headphones];
  const features = t("home.features");

  const onSearch = () =>
    navigate(`/search${q ? `?q=${encodeURIComponent(q)}` : ""}`);

  return (
    <section className="container-app pt-6">
      <div className="relative flex justify-center gap-8 overflow-hidden rounded-card bg-[linear-gradient(90deg,#4B6898_14.26%,#243757_101.43%)] px-6 py-10 shadow-soft sm:px-10 lg:gap-12 lg:py-14">
        {/* Decorative teal glows behind the photo */}
        <div className="absolute -right-20 top-56 hidden h-72 w-72 rounded-full bg-[#6BCEEE] opacity-30 lg:block xl:h-[28rem] xl:w-[28rem]" />
        <div className="absolute top-36 right-3 hidden h-72 w-72 rounded-full bg-[#6BCEEE] opacity-30 lg:block xl:h-[28rem] xl:w-[28rem]" />
        {/* Soft white glow behind the text for contrast */}
        <div className="absolute -left-10 -top-10 h-64 w-[85%] max-w-xl rounded-full bg-white/60 blur-[150px]" />

        {/* Teacher photo (right side) */}
        <div className="relative hidden w-[300px] shrink-0 lg:block xl:w-[430px]">
          <img
            src="/hero-teacher.png"
            alt=""
            className="absolute -bottom-56 left-0 h-auto w-full rounded-2xl object-cover object-top"
          />
        </div>

        {/* Text column (left side) */}
        <div className="relative z-10 flex max-w-xl flex-1 flex-col justify-center gap-5 font-cairo lg:max-w-[65%]">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-pill bg-white px-3 py-1.5 text-xs font-semibold text-[#34C759]">
            <CheckCircle2 size={16} /> {t("home.heroBadge")}
          </span>

          <div>
            <h1 className="text-3xl font-bold leading-tight text-white lg:text-[48px]">
              {t("home.heroTitle1")}
            </h1>
            <h2 className="mt-1 text-2xl font-bold leading-tight text-[#1E1E1E] lg:text-[40px]">
              {t("home.heroTitle2")}
            </h2>
          </div>

          <p className="max-w-2xl text-sm leading-relaxed text-white lg:text-base">
            {t("home.heroSubtitle")}
          </p>

          {/* Search */}
          <div className="flex max-w-md">
            <div className="flex flex-1 items-center overflow-hidden rounded-btn bg-white/95">
              <button
                onClick={onSearch}
                className="px-4 text-primary"
                aria-label="بحث"
              >
                <Search size={18} />
              </button>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
                placeholder={t("home.heroSearchPlaceholder")}
                className="flex-1 bg-transparent py-3 pl-4 text-sm text-ink outline-none placeholder:text-ink-soft"
              />
            </div>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-4">
            {features.map((f, i) => {
              const Icon = featureIcons[i];
              return (
                <span
                  key={f}
                  className="inline-flex items-center gap-1.5 text-xs text-white/90"
                >
                  <Icon size={14} className="text-[#6BCEEE]" /> {f}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
