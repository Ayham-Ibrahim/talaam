import { Phone, Mail, Facebook, Instagram, Youtube } from "lucide-react";
import { TikTokIcon, WhatsAppIcon } from "@/components/icons/SocialIcons";
import { Logo } from "./Logo";
import { useT } from "@/hooks/useT";
import { SplitWords } from "@/motion/scroll/SplitWords";

// رقم الهاتف/واتساب الرسمي الوحيد — يُستخدَم للعرض وللرابطين (tel:/wa.me) معاً.
const PHONE_DISPLAY = "+971 52 942 6077";
const PHONE_DIGITS = "971529426077"; // بلا + ولا فراغات — الصيغة التي يتطلبها wa.me
const EMAIL = "TAALAM@gmail.com";

const SOCIAL_LINKS = [
  { Icon: Facebook, href: "https://www.facebook.com/profile.php?id=61562033186054", label: "Facebook" },
  { Icon: Instagram, href: "https://www.instagram.com/taalam.2024/", label: "Instagram" },
  { Icon: TikTokIcon, href: "https://www.tiktok.com/@t3allem.edu", label: "TikTok" },
  { Icon: Youtube, href: "https://youtube.com/@t3allemedu", label: "YouTube" },
];

export function Footer() {
  const t = useT();

  const quickLinks = [
    t("nav.resources"),
    t("nav.howItWorks"),
    t("nav.search"),
    t("nav.home"),
  ];
  const companyLinks = [
    t("footer.about"),
    t("footer.privacy"),
    t("footer.terms"),
    t("footer.contactUs"),
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
                <li key={l}>
                  <a href="#" className="hover:text-ink transition-colors">
                    {l}
                  </a>
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
                <li key={l}>
                  <a href="#" className="hover:text-ink transition-colors">
                    {l}
                  </a>
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
                <a href={`mailto:${EMAIL}`} className="hover:text-ink transition-colors">
                  {EMAIL}
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
