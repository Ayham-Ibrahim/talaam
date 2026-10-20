import { Link } from "react-router-dom";
import { Phone, Mail, Facebook, Instagram, Youtube } from "lucide-react";
import { TikTokIcon, WhatsAppIcon } from "@/components/icons/SocialIcons";
import { Logo } from "./Logo";
import { useContactInfo } from "@/hooks/useMeta";
import { useT } from "@/hooks/useT";
import { SplitWords } from "@/motion/scroll/SplitWords";

// رقم الهاتف/واتساب الرسمي الوحيد — يُستخدَم للعرض وللرابطين (tel:/wa.me) معاً.
const PHONE_DISPLAY = "+971 52 942 6077";
const PHONE_DIGITS = "971529426077"; // بلا + ولا فراغات — الصيغة التي يتطلبها wa.me
// احتياط قبل اكتمال جلب الإعداد أو عند فشل الطلب — المصدر الحقيقي هو إعدادات الأدمن (contact_email)
const EMAIL_FALLBACK = "taalam@t3allem.com";

const SOCIAL_LINKS = [
  { Icon: Facebook, href: "https://www.facebook.com/profile.php?id=61562033186054", label: "Facebook" },
  { Icon: Instagram, href: "https://www.instagram.com/taalam.2024/", label: "Instagram" },
  { Icon: TikTokIcon, href: "https://www.tiktok.com/@t3allem.edu", label: "TikTok" },
  { Icon: Youtube, href: "https://youtube.com/@t3allemedu", label: "YouTube" },
];

export function Footer() {
  const t = useT();
  const { data: contactInfo } = useContactInfo();
  const email = contactInfo?.email || EMAIL_FALLBACK;

  // لا صفحة فعلية بعد لـ"الموارد التعليمية" — تبقى بلا رابط، بعكس بقية هذه الروابط
  const quickLinks = [
    { label: t("nav.resources"), to: null },
    { label: t("nav.howItWorks"), to: "/how-it-works" },
    { label: t("nav.search"), to: "/search" },
    { label: t("nav.home"), to: "/" },
  ];
  const companyLinks = [
    { label: t("footer.about"), to: "/about" },
    { label: t("footer.privacy"), to: "/privacy-policy" },
    { label: t("footer.terms"), to: "/terms-conditions" },
    { label: t("footer.contactUs"), to: "/contact" },
  ];

  return (
    <footer className="bg-surface border-t border-line mt-16">
      <div className="container-app py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Logo className="mb-4 " />
            <p className="text-sm text-ink-soft leading-relaxed">
              {t("brand.tagline")}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <SplitWords
              as="h4"
              className="font-bold text-ink mb-4"
              y={30}
              stagger={0.06}
              duration={0.7}
              ease="power3.out"
              start="top 90%"
            >
              {t("footer.quickLinks")}
            </SplitWords>
            <ul className="space-y-2.5 text-sm text-ink-soft">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  {l.to ? (
                    <Link to={l.to} className="hover:text-ink transition-colors">
                      {l.label}
                    </Link>
                  ) : (
                    <span className="cursor-default text-ink-soft/70">{l.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <SplitWords
              as="h4"
              className="font-bold text-ink mb-4"
              y={30}
              stagger={0.06}
              duration={0.7}
              ease="power3.out"
              start="top 90%"
            >
              {t("footer.company")}
            </SplitWords>
            <ul className="space-y-2.5 text-sm text-ink-soft">
              {companyLinks.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="hover:text-ink transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <SplitWords
              as="h4"
              className="font-bold text-ink mb-4"
              y={30}
              stagger={0.06}
              duration={0.7}
              ease="power3.out"
              start="top 90%"
            >
              {t("footer.contact")}
            </SplitWords>
            <ul className="space-y-3 text-sm text-ink-soft">
              <li className="flex items-center gap-2">
                <Phone size={15} />
                <a href={`tel:+${PHONE_DIGITS}`} dir="ltr" className="hover:text-ink transition-colors">
                  {PHONE_DISPLAY}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={15} />
                <a href={`mailto:${email}`} className="hover:text-ink transition-colors">
                  {email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <WhatsAppIcon size={15} />
                <a
                  href={`https://wa.me/${PHONE_DIGITS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  dir="ltr"
                  className="hover:text-ink transition-colors"
                >
                  {PHONE_DISPLAY}
                </a>
              </li>
            </ul>
            <div className="flex gap-3 mt-4 ">
              {SOCIAL_LINKS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full bg-canvas flex items-center justify-center hover:bg-line/60 transition-colors"
                  aria-label={label}
                >
                  <Icon size={16} className="text-ink-soft" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-line mt-10 pt-6 text-center text-xs text-ink-soft">
          {t("footer.copyright")}
        </div>
      </div>
    </footer>
  );
}
