/**
 * LanguageSwitcher
 *
 * A compact inline toggle that lives in the Navbar.
 * Renders:  🌐 EN | తెలుగు
 * The active language label is full-brightness white; the inactive one is dimmed.
 * Keyboard accessible, with focus ring and aria-pressed.
 *
 * Usage:
 *   <LanguageSwitcher />           — white text (for dark navbar)
 *   <LanguageSwitcher dark />      — navy text (for light backgrounds, e.g. mobile drawer)
 */
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSwitcher({ dark = false }) {
  const { lang, setLang } = useLanguage();

  const base =
    'text-xs font-semibold px-2 py-1 rounded-md transition-colors duration-200 ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-church-gold';

  const activeClass = dark
    ? 'text-church-blue'
    : 'text-white';

  const inactiveClass = dark
    ? 'text-gray-400 hover:text-church-blue'
    : 'text-white/45 hover:text-white/80';

  return (
    <div
      className="flex items-center gap-0.5"
      role="group"
      aria-label="Language selection"
    >
      {/* Globe icon */}
      <span
        className={dark ? 'text-gray-400 text-xs mr-0.5' : 'text-white/40 text-xs mr-0.5'}
        aria-hidden="true"
      >
        🌐
      </span>

      {/* English */}
      <button
        type="button"
        className={`${base} ${lang === 'en' ? activeClass : inactiveClass}`}
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
        aria-label="Switch to English"
      >
        EN
      </button>

      {/* Divider */}
      <span
        className={dark ? 'text-gray-300 select-none' : 'text-white/25 select-none'}
        aria-hidden="true"
      >
        |
      </span>

      {/* Telugu */}
      <button
        type="button"
        className={`${base} ${lang === 'te' ? activeClass : inactiveClass}`}
        onClick={() => setLang('te')}
        aria-pressed={lang === 'te'}
        aria-label="తెలుగులోకి మారండి (Switch to Telugu)"
        lang="te"
      >
        తెలుగు
      </button>
    </div>
  );
}
