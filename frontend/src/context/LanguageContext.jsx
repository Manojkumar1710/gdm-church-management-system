/**
 * LanguageContext
 *
 * Provides:
 *   lang      – current language code ('en' | 'te')
 *   setLang   – change language
 *   t(key, vars?) – translate a dot-notation key, e.g. t('nav.home');
 *                   optional vars fill {token} placeholders
 *   dateLocale – locale string for date formatting
 *
 * Persistence: localStorage key 'gdm-language'
 * Fallback: English when a key is missing in the active language.
 */

import { createContext, useContext, useState, useCallback } from 'react';
import translations from '../i18n/translations';

const STORAGE_KEY = 'gdm-language';
const SUPPORTED    = ['en', 'te'];
const DEFAULT_LANG = 'en';

/* ── helpers ──────────────────────────────────────────────────── */
function getInitialLang() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;
  } catch { /* private browsing */ }
  return DEFAULT_LANG;
}

/**
 * Resolve a dot-notation key against a translations object.
 * e.g. 'nav.home' → translations.en.nav.home
 */
function resolve(obj, key) {
  return key.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
}

/* ── Context ──────────────────────────────────────────────────── */
const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLang);

  const setLang = useCallback((code) => {
    if (!SUPPORTED.includes(code)) return;
    setLangState(code);
    try { localStorage.setItem(STORAGE_KEY, code); } catch { /* ignore */ }
    // Update <html lang=""> for accessibility
    document.documentElement.lang = code === 'te' ? 'te' : 'en';
  }, []);

  /**
   * Translate a key.
   * Falls back to English if the key is missing in the active language.
   * Returns the key itself if not found in either language (so it's visible in dev).
   * Optional `vars` replaces {token} placeholders, e.g.
   *   t('admin.toast.created', { entity: 'Event' })
   */
  const t = useCallback((key, vars) => {
    const active  = resolve(translations[lang], key);
    let value;
    if (active !== undefined) {
      value = active;
    } else {
      const fallback = resolve(translations[DEFAULT_LANG], key);
      value = fallback !== undefined ? fallback : key;
    }
    if (vars && typeof value === 'string' && value.includes('{')) {
      value = value.replace(/\{(\w+)\}/g, (match, name) =>
        vars[name] !== undefined ? String(vars[name]) : match
      );
    }
    return value;
  }, [lang]);

  /** Date locale for Intl.DateTimeFormat */
  const dateLocale = lang === 'te' ? 'te-IN' : 'en-IN';

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dateLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}

/** Convenience alias */
export const useT = useLanguage;
