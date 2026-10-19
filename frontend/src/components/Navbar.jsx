import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { CHURCH_NAME_LINE1, CHURCH_NAME_LINE2 } from '../config/church';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

/* ── Nav link definitions (to values stay in sync with App.jsx) ── */
const NAV_KEYS = [
  { key: 'home',        to: '/',              end: true },
  { key: 'about',       to: '/about' },
  { key: 'events',      to: '/events' },
  { key: 'photos',      to: '/photos' },
  { key: 'pastors',     to: '/pastors' },
  { key: 'sermons',     to: '/sermons' },
  { key: 'gallery',     to: '/gallery' },
  { key: 'sundaySchool',to: '/sunday-school' },
  { key: 'contact',     to: '/contact' },
];

/* ── Single desktop link with sliding underline ── */
function DesktopLink({ label, to, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className="relative px-2.5 py-1.5 text-sm font-medium transition-colors duration-300
                 whitespace-nowrap group focus:outline-none focus-visible:ring-2
                 focus-visible:ring-white rounded-md"
    >
      {({ isActive }) => (
        <>
          <span className={isActive ? 'text-white' : 'text-white/75 group-hover:text-white'}>
            {label}
          </span>
          {/* sliding underline */}
          {isActive && (
            <motion.span
              layoutId="nav-underline"
              className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-church-gold"
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

export default function Navbar() {
  const [open,     setOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location   = useLocation();
  const reduced    = useReducedMotion();
  const { t }      = useLanguage();

  /* Close drawer on route change */
  useEffect(() => { setOpen(false); }, [location.pathname]);

  /* Transparent only on the homepage before scroll; solid on all other pages */
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Lock body scroll while drawer is open */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  /* ── Navbar root classes ── */
  const navCls = `
    fixed top-0 inset-x-0 z-50 transition-all
    ${reduced ? '' : 'duration-400'}
    ${isHome && !scrolled
      ? 'bg-transparent'
      : 'bg-church-blue shadow-lg'}
  `;

  return (
    <>
      <nav className={navCls} style={{ transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo — two-line brand ── */}
            <Link
              to="/"
              className="flex items-center gap-2.5 shrink-0 focus:outline-none
                         focus-visible:ring-2 focus-visible:ring-church-gold rounded-md"
            >
              <span className="text-church-gold text-2xl leading-none select-none">✝</span>
              <span className="flex flex-col leading-tight">
                <span
                  className="text-white/70 text-[9px] font-semibold tracking-[0.18em] uppercase"
                >
                  {CHURCH_NAME_LINE1}
                </span>
                <span
                  className="text-white font-bold text-base tracking-wide"
                  style={{ fontFamily: 'Lora, Georgia, serif' }}
                >
                  {CHURCH_NAME_LINE2}
                </span>
              </span>
            </Link>

            {/* ── Desktop links + language switcher (collapse at lg) ── */}
            <div className="hidden lg:flex items-center gap-0.5">
              {NAV_KEYS.map(({ key, to, end }) => (
                <DesktopLink key={to} label={t(`nav.${key}`)} to={to} end={end} />
              ))}
              <Link
                to="/offerings"
                className="ml-3 btn-gold btn-sm rounded-xl"
              >
                {t('nav.give')}
              </Link>
              {/* Language switcher — separated by a subtle divider */}
              <span className="ml-3 w-px h-5 bg-white/20" aria-hidden="true" />
              <div className="ml-2">
                <LanguageSwitcher />
              </div>
            </div>

            {/* ── Hamburger (visible below lg) ── */}
            <button
              className="lg:hidden p-2 rounded-lg text-white/80 hover:text-white
                         hover:bg-white/10 transition-colors
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              onClick={() => setOpen(v => !v)}
              aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              {open
                ? <XMarkIcon  className="h-6 w-6" />
                : <Bars3Icon  className="h-6 w-6" />
              }
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile drawer ────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />

            {/* Slide-in panel from the right */}
            <motion.aside
              id="mobile-menu"
              className="fixed top-0 right-0 bottom-0 z-50 w-72 lg:hidden
                         flex flex-col bg-navy-950 shadow-2xl overflow-y-auto"
              initial={{ x: reduced ? 0 : '100%', opacity: reduced ? 0 : 1 }}
              animate={{ x: 0,    opacity: 1 }}
              exit={{    x: reduced ? 0 : '100%', opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              aria-label="Navigation menu"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4
                              border-b border-white/10">
                <span
                  className="text-white font-bold text-base flex items-center gap-2"
                  style={{ fontFamily: 'Lora, Georgia, serif' }}
                >
                  <span className="text-church-gold">✝</span>
                  <span className="flex flex-col leading-tight">
                    <span className="text-white/60 text-[8px] font-semibold tracking-[0.16em] uppercase">
                      {CHURCH_NAME_LINE1}
                    </span>
                    <span className="text-white font-bold text-sm">
                      {CHURCH_NAME_LINE2}
                    </span>
                  </span>
                </span>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-white/60 hover:text-white
                             hover:bg-white/10 transition-colors
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  aria-label={t('nav.closeMenu')}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Language switcher inside drawer */}
              <div className="px-5 pt-4 pb-2">
                <LanguageSwitcher dark />
              </div>

              {/* Nav links */}
              <nav className="flex-1 px-4 py-3 space-y-1">
                {NAV_KEYS.map(({ key, to, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 rounded-xl text-sm font-medium
                       transition-colors duration-200 ${
                        isActive
                          ? 'bg-white/15 text-white border-l-2 border-church-gold pl-3.5'
                          : 'text-white/70 hover:bg-white/8 hover:text-white'
                      }`
                    }
                  >
                    {t(`nav.${key}`)}
                  </NavLink>
                ))}
              </nav>

              {/* Give CTA at bottom of drawer */}
              <div className="px-4 pb-6 pt-2 border-t border-white/10">
                <Link
                  to="/offerings"
                  className="flex items-center justify-center gap-2 w-full
                             btn-gold rounded-xl py-3 text-sm font-semibold"
                >
                  {t('nav.giveOffering')}
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
