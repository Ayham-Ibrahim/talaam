import { useContext } from 'react';
import ar from '@/locales/ar.json';
import en from '@/locales/en.json';
import { useLocaleStore } from '@/store';
import { LocaleOverrideContext } from '@/context/LocaleOverrideContext';

/**
 * Minimal i18n accessor. All UI strings come from locale files —
 * no hardcoded text in components.
 * Falls back to Arabic for any key missing from the active dictionary.
 * DashboardLayout provides a "ar" override via LocaleOverrideContext so the
 * dashboard stays Arabic even for keys shared with the public site (e.g.
 * "teacher.sessionMinutes") that DO have an English translation.
 * Usage: const t = useT(); t('home.heroTitle1')
 */
const dictionaries = { ar, en };

function lookup(dict, path) {
  return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), dict);
}

export function useT() {
  const globalLocale = useLocaleStore((s) => s.locale);
  const localeOverride = useContext(LocaleOverrideContext);
  const locale = localeOverride ?? globalLocale;
  return function t(path) {
    return lookup(dictionaries[locale], path) ?? lookup(dictionaries.ar, path) ?? path;
  };
}
