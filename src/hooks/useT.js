import ar from '@/locales/ar.json';

/**
 * Minimal i18n accessor. All UI strings come from locale files —
 * no hardcoded text in components. Swap/extend for multi-language later.
 * Usage: const t = useT(); t('home.heroTitle1')
 */
const dictionaries = { ar };
const activeLocale = 'ar';

export function useT() {
  const dict = dictionaries[activeLocale];
  return function t(path) {
    return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), dict) ?? path;
  };
}
