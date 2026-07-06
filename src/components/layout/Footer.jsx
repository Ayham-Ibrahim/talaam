import { Phone, Mail, MessageCircle, Twitter, Facebook, Instagram } from 'lucide-react';
import { Logo } from './Logo';
import { useT } from '@/hooks/useT';

export function Footer() {
  const t = useT();

  const quickLinks = [t('nav.resources'), t('nav.howItWorks'), t('nav.search'), t('nav.home')];
  const companyLinks = [t('footer.about'), t('footer.privacy'), t('footer.terms'), t('footer.contactUs')];

  return (
    <footer className="bg-surface border-t border-line mt-16">
      <div className="container-app py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Logo className="mb-4 justify-end" />
            <p className="text-sm text-ink-soft leading-relaxed">{t('brand.tagline')}</p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-bold text-ink mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2.5 text-sm text-ink-soft">
              {quickLinks.map((l) => (
                <li key={l}><a href="#" className="hover:text-ink transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-ink mb-4">{t('footer.company')}</h4>
            <ul className="space-y-2.5 text-sm text-ink-soft">
              {companyLinks.map((l) => (
                <li key={l}><a href="#" className="hover:text-ink transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-ink mb-4">{t('footer.contact')}</h4>
            <ul className="space-y-3 text-sm text-ink-soft">
              <li className="flex items-center gap-2 justify-end">
                <span dir="ltr">966625651651</span> <Phone size={15} />
              </li>
              <li className="flex items-center gap-2 justify-end">
                <span>TAALAM@gmail.com</span> <Mail size={15} />
              </li>
              <li className="flex items-center gap-2 justify-end">
                <span dir="ltr">+9653654154156</span> <MessageCircle size={15} />
              </li>
            </ul>
            <div className="flex gap-3 mt-4 justify-end">
              {[Twitter, Facebook, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full bg-canvas flex items-center justify-center hover:bg-line/60 transition-colors" aria-label="social">
                  <Icon size={16} className="text-ink-soft" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-line mt-10 pt-6 text-center text-xs text-ink-soft">
          {t('footer.copyright')}
        </div>
      </div>
    </footer>
  );
}
