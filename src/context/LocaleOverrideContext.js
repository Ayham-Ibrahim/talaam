import { createContext } from 'react';

/**
 * Lets a subtree force a specific locale regardless of the site-wide
 * LanguageSwitcher toggle. DashboardLayout provides "ar" here so the
 * dashboard never reflects the public website's language choice, even for
 * keys that happen to exist in both locale dictionaries (e.g. "teacher.*").
 */
export const LocaleOverrideContext = createContext(null);
