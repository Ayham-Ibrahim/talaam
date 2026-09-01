import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, ApiErrorList } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useCreateComplaint } from "@/hooks/useComplaint";
import { useT } from "@/hooks/useT";
import { sanitizeName, validateEmail, validateName } from "@/lib/accountFormValidation";

const INFO_ICONS = { email: Mail, phone: Phone, address: MapPin };

const CATEGORY_KEYS = [
  "session_quality",
  "teacher_no_show",
  "technical_issue",
  "payment_issue",
  "schedule_issue",
  "other",
];

const MESSAGE_MAX_LENGTH = 500;

/** validateName/validateEmail return 'required' | 'tooLong' | 'invalid' | null — same convention as AddStudentAccountModal.jsx */
function fieldErrorKey(prefix, validationResult) {
  if (!validationResult) return null;
  const suffix = validationResult === "tooLong" ? "TooLong" : validationResult === "required" ? "Required" : "Invalid";
  return `contact.${prefix}${suffix}`;
}

/**
 * الطالب/المعلم المسجّل دخوله يرسل شكوى حقيقية عبر POST /api/complaints —
 * تظهر في قسم الشكاوى عند الأدمن مع إشعار فوري له (ComplaintService::file).
 * قبل هذا الإصلاح كان النموذج زخرفياً بالكامل (onSubmit={preventDefault})
 * حتى للمستخدم المسجّل دخوله — لا شيء يصل للباك اند إطلاقاً.
 */
function ComplaintForm() {
  const t = useT();
  const { user } = useAuth();
  const createComplaint = useCreateComplaint();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState(false);
  const [success, setSuccess] = useState(false);

  const nameValidation = validateName(name);
  const emailValidation = validateEmail(email);
  const categoryMissing = category === "";
  const trimmedMessage = message.trim();
  const messageMissing = trimmedMessage === "";
  const messageTooLong = trimmedMessage.length > MESSAGE_MAX_LENGTH;
  const isValid = !nameValidation && !emailValidation && !categoryMissing && !messageMissing && !messageTooLong;

  const nameErrorKey = touched ? fieldErrorKey("name", nameValidation) : null;
  const emailErrorKey = touched ? fieldErrorKey("email", emailValidation) : null;
  const messageErrorKey = touched ? (messageMissing ? "contact.messageRequired" : messageTooLong ? "contact.messageTooLong" : null) : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    setSuccess(false);
    if (!isValid) return;

    // Complaint لا تملك أعمدة name/email مستقلة (الهوية معروفة أصلاً من التوكن) —
    // تُدرَج هنا في نص الوصف فقط ليعرف الأدمن على أي بريد/باسم يتابع مع المُرسِل.
    const description = `${t("contact.fields.name")}: ${name.trim()}\n${t("contact.fields.email")}: ${email.trim()}\n\n${trimmedMessage}`;

    createComplaint.mutate(
      { category, description },
      {
        onSuccess: () => {
          setCategory("");
          setMessage("");
          setTouched(false);
          setSuccess(true);
        },
      }
    );
  };

  return (
    <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
      {success && (
        <div className="rounded-lg bg-success-light px-4 py-3 text-sm font-medium text-success">
          {t("contact.success")}
        </div>
      )}
      {createComplaint.isError && <ApiErrorList error={createComplaint.error} className="mb-1" />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-start">
          <span className="font-cairo text-sm font-semibold text-[#4B6898]">{t("contact.fields.name")}</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(sanitizeName(e.target.value))}
            placeholder={t("contact.fields.namePlaceholder")}
            className={`rounded-lg border px-3 py-3 text-start font-cairo text-sm text-ink placeholder:text-[#AEAEB2] focus:outline-none ${
              nameErrorKey ? "border-accent-pink" : "border-[#E3E3E3] focus:border-[#4B6898]"
            }`}
          />
          {nameErrorKey && <span className="text-xs text-accent-pink">{t(nameErrorKey)}</span>}
        </label>

        <label className="flex flex-col gap-1 text-start">
          <span className="font-cairo text-sm font-semibold text-[#4B6898]">{t("contact.fields.email")}</span>
          <input
            type="email"
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("contact.fields.emailPlaceholder")}
            className={`rounded-lg border px-3 py-3 text-start font-cairo text-sm text-ink placeholder:text-[#AEAEB2] focus:outline-none ${
              emailErrorKey ? "border-accent-pink" : "border-[#E3E3E3] focus:border-[#4B6898]"
            }`}
          />
          {emailErrorKey && <span className="text-xs text-accent-pink">{t(emailErrorKey)}</span>}
        </label>
      </div>

      <label className="flex flex-col gap-1 text-start">
        <span className="font-cairo text-sm font-semibold text-[#4B6898]">{t("contact.categoryLabel")}</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={`rounded-lg border px-3 py-3 text-start font-cairo text-sm text-ink focus:outline-none ${
            touched && categoryMissing ? "border-accent-pink" : "border-[#E3E3E3] focus:border-[#4B6898]"
          }`}
        >
          <option value="">{t("contact.categoryPlaceholder")}</option>
          {CATEGORY_KEYS.map((key) => (
            <option key={key} value={key}>
              {t(`contact.categories.${key}`)}
            </option>
          ))}
        </select>
        {touched && categoryMissing && <span className="text-xs text-accent-pink">{t("contact.categoryRequired")}</span>}
      </label>

      <label className="flex flex-col gap-1 text-start">
        <div className="flex items-center justify-between">
          <span className="font-cairo text-sm font-semibold text-[#4B6898]">{t("contact.fields.message")}</span>
          <span className={`font-cairo text-xs ${messageTooLong ? "text-accent-pink" : "text-ink-soft"}`}>
            {trimmedMessage.length}/{MESSAGE_MAX_LENGTH}
          </span>
        </div>
        <textarea
          rows={5}
          maxLength={MESSAGE_MAX_LENGTH}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("contact.fields.messagePlaceholder")}
          className={`resize-none rounded-lg border px-3 py-3 text-start font-cairo text-sm text-ink placeholder:text-[#AEAEB2] focus:outline-none ${
            messageErrorKey ? "border-accent-pink" : "border-[#E3E3E3] focus:border-[#4B6898]"
          }`}
        />
        {messageErrorKey && <span className="text-xs text-accent-pink">{t(messageErrorKey)}</span>}
      </label>

      <button
        type="submit"
        disabled={createComplaint.isPending}
        className="rounded-lg bg-[#4B6898] py-3 font-cairo text-sm text-white transition-colors hover:bg-[#3d5680] disabled:opacity-50"
      >
        {createComplaint.isPending ? t("contact.submitting") : t("contact.submit")}
      </button>
    </form>
  );
}

/** زائر غير مسجّل دخوله (أو مسجّل بحساب أدمن) — لا مسار خلفي لشكوى مجهولة الهوية، فنطلب تسجيل الدخول صراحةً بدل نموذج صامت لا يفعل شيئاً. */
function LoginRequiredNotice() {
  const t = useT();
  return (
    <div className="mt-6 rounded-lg border border-[#E3E3E3] bg-[#F7F8FD] px-6 py-8 text-center">
      <h3 className="font-cairo text-lg font-bold text-[#4B6898]">{t("contact.loginRequiredTitle")}</h3>
      <p className="mt-2 font-cairo text-sm text-ink-soft">{t("contact.loginRequiredHint")}</p>
      <Link
        to="/login"
        className="mt-4 inline-block rounded-lg bg-[#4B6898] px-6 py-2.5 font-cairo text-sm text-white transition-colors hover:bg-[#3d5680]"
      >
        {t("contact.loginCta")}
      </Link>
    </div>
  );
}

export function ContactPage() {
  const t = useT();
  const { user } = useAuth();
  const canFileComplaint = user?.role === "student" || user?.role === "teacher";
  const info = t("contact.info");

  return (
    <PageContainer>
      {/* Hero */}
      <section className="container-app mt-8">
        <div className="relative overflow-hidden rounded-[24px] px-8 py-14 shadow-[0_1px_5px_rgba(0,0,0,0.1)] lg:px-16 lg:py-16">
          <motion.div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage:
                "linear-gradient(120deg, #4B6898, #243757, #35507D, #4B6898)",
              backgroundSize: "300% 300%",
            }}
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="pointer-events-none absolute -top-4 left-1/4 h-64 w-3/5 rounded-full bg-white/60 blur-[120px]" />

          <div className="relative z-10 flex items-center w-full justify-between gap-8">
            <div className="max-w-2xl text-start ">
              <h1 className="font-cairo text-3xl font-bold text-white lg:text-4xl">
                {t("contact.heroTitle")}
              </h1>
              <p className="mt-4 font-cairo text-lg font-medium leading-10 text-white lg:text-xl">
                {t("contact.heroSubtitle")}
              </p>
            </div>
            <div className="hidden shrink-0 lg:block">
              <img
                src="/contact.webp"
                alt=""
                loading="lazy"
                decoding="async"
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
                <div className="text-start">
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

          {canFileComplaint ? <ComplaintForm /> : <LoginRequiredNotice />}
        </Card>
      </section>
    </PageContainer>
  );
}
