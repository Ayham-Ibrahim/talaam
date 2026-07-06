import { Mail, Phone, MapPin } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui";
import { useT } from "@/hooks/useT";

const INFO_ICONS = { email: Mail, phone: Phone, address: MapPin };

const FIELDS = [
  { key: "email", type: "email" },
  { key: "name", type: "text" },
  { key: "subject", type: "text" },
  { key: "message", type: "text" },
];

export function ContactPage() {
  const t = useT();
  const info = t("contact.info");
  const fields = t("contact.fields");

  return (
    <PageContainer>
      {/* Hero */}
      <section className="container-app mt-8">
        <div className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(89.95deg,#4B6898_3.11%,#243757_98.69%)] px-8 py-14 shadow-[0_1px_5px_rgba(0,0,0,0.1)] lg:px-16 lg:py-16">
          <div className="pointer-events-none absolute -top-4 left-1/4 h-64 w-3/5 rounded-full bg-white/60 blur-[120px]" />

          <div className="relative z-10 flex items-center w-full justify-between gap-8">
            <div className="max-w-2xl text-right ">
              <h1 className="font-cairo text-3xl font-bold text-white lg:text-4xl">
                {t("contact.heroTitle")}
              </h1>
              <p className="mt-4 font-cairo text-lg font-medium leading-10 text-white lg:text-xl">
                {t("contact.heroSubtitle")}
              </p>
            </div>
            <div className="hidden shrink-0 lg:block">
              <img
                src="/contact.png"
                alt=""
                className="h-56 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Info + Form */}
      <section className="container-app mt-14 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_3fr]">
        {/* Contact info */}
        <Card className="flex flex-col justify-center gap-8 p-6 lg:p-8">
          {info.map((item) => {
            const Icon = INFO_ICONS[item.key] || Mail;
            return (
              <div
                key={item.key}
                className="flex items-center justify-between gap-4"
              >
                <div className="text-right">
                  <h3 className="mb-1 font-cairo text-xl font-bold text-[#4B6898]">
                    {item.label}
                  </h3>
                  <p className="font-cairo text-base text-ink" dir="ltr">
                    {item.value}
                  </p>
                </div>
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#EDF0F5]">
                  <Icon size={28} className="text-[#4B6898]" />
                </div>
              </div>
            );
          })}
        </Card>

        {/* Form */}
        <Card className="p-6 lg:p-8">
          <div className="text-center">
            <h2 className="font-cairo text-2xl font-bold text-[#4B6898]">
              {t("contact.formTitle")}
            </h2>
            <p className="mt-2 font-cairo text-base text-ink-soft">
              {t("contact.formSubtitle")}
            </p>
          </div>

          <form
            className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2"
            onSubmit={(e) => e.preventDefault()}
          >
            {FIELDS.map((field) => (
              <label key={field.key} className="flex flex-col gap-1 text-right">
                <span className="font-cairo text-sm font-semibold text-[#4B6898]">
                  {fields[field.key]}
                </span>
                <input
                  type={field.type}
                  placeholder={fields[`${field.key}Placeholder`]}
                  className="rounded-lg border border-[#E3E3E3] px-3 py-3 text-right font-cairo text-sm text-ink placeholder:text-[#AEAEB2] focus:border-[#4B6898] focus:outline-none"
                />
              </label>
            ))}
            <button
              type="submit"
              className="rounded-lg bg-[#4B6898] py-3 font-cairo text-sm text-white transition-colors hover:bg-[#3d5680] sm:col-span-2"
            >
              {t("contact.submit")}
            </button>
          </form>
        </Card>
      </section>
    </PageContainer>
  );
}
