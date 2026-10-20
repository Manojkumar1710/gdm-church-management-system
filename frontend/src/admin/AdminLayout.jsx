import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon, CalendarIcon, PhotoIcon, UserGroupIcon, BookOpenIcon,
  PlayIcon, RectangleGroupIcon, BanknotesIcon, HandRaisedIcon,
  EnvelopeIcon, AcademicCapIcon, Bars3Icon, XMarkIcon,
  ArrowRightOnRectangleIcon, GlobeAltIcon, ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

/* Nav group definitions — `key` values are i18n keys under admin.nav */
const NAV_GROUPS = [
  {
    key: 'content',
    items: [
      { key: 'dashboard',      to: '/admin/dashboard',              match: '/admin/dashboard',             icon: HomeIcon },
      { key: 'events',         to: '/admin/events',                 match: '/admin/events',                icon: CalendarIcon },
      { key: 'eventPhotos',    to: '/admin/event-photos',           match: '/admin/event-photos',          icon: PhotoIcon },
      { key: 'pastors',        to: '/admin/pastors',                match: '/admin/pastors',               icon: UserGroupIcon },
      { key: 'schedule',       to: '/admin/pastor-schedule',        match: '/admin/pastor-schedule',       icon: CalendarIcon },
      { key: 'sermons',        to: '/admin/sermons',                match: '/admin/sermons',               icon: BookOpenIcon },
      { key: 'youtube',        to: '/admin/youtube',                match: '/admin/youtube',               icon: PlayIcon },
      { key: 'gallery',        to: '/admin/gallery',                match: '/admin/gallery',               icon: RectangleGroupIcon },
    ],
  },
  {
    key: 'community',
    items: [
      { key: 'offerings',      to: '/admin/offerings',              match: '/admin/offerings',             icon: BanknotesIcon },
      { key: 'prayerRequests', to: '/admin/prayer-requests',        match: '/admin/prayer-requests',       icon: HandRaisedIcon },
      { key: 'messages',       to: '/admin/contact-messages',       match: '/admin/contact-messages',      icon: EnvelopeIcon },
      { key: 'sundaySchool',   to: '/admin/sunday-school/children', match: '/admin/sunday-school',         icon: AcademicCapIcon },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap(g => g.items);

function NavItem({ label, to, icon: Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `admin-nav-item ${isActive ? 'is-active' : ''}`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
      <span className="admin-nav-label">{label}</span>
    </NavLink>
  );
}

function Sidebar({ onClose }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const closeRef = useRef(null);

  useEffect(() => {
    if (!onClose) return;
    closeRef.current?.focus();
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
    onClose?.();
  };

  return (
    <div className="flex h-full flex-col">

      {/* Brand */}
      <div className="flex shrink-0 items-center gap-3 border-b border-white/10 px-4 py-4">
        <Link to="/" className="group flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-church-gold">
          <span className="admin-emblem" aria-hidden="true">✝</span>
          <span className="min-w-0">
            <span className="admin-brand-name block truncate">GDM Church</span>
            <span className="admin-brand-tag block">{t('admin.shell.brandTag')}</span>
          </span>
        </Link>
        {onClose && (
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label={t('admin.shell.closeMenu')}
            className="ml-auto inline-grid h-9 w-9 place-items-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-church-gold"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Navigation — independently scrollable */}
      <nav className="admin-nav-scroll" aria-label={t('admin.shell.root')}>
        {NAV_GROUPS.map(group => (
          <div key={group.key}>
            <p className="admin-nav-title">{t(`admin.nav.${group.key}`)}</p>
            <ul className="space-y-1">
              {group.items.map(item => (
                <li key={item.to}>
                  <NavItem label={t(`admin.nav.${item.key}`)} to={item.to} icon={item.icon} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Fixed footer — sits below the scroll area, never covers links */}
      <div className="admin-sidebar-foot">
        <div className="flex items-center justify-between gap-2 px-1 py-1">
          <LanguageSwitcher />
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold text-white/55 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-church-gold"
          >
            <GlobeAltIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {t('admin.viewSite')}
          </Link>
        </div>

        <div className="mt-2 flex items-center gap-2.5 rounded-xl bg-white/8 px-3 py-2.5">
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-church-gold/25 text-xs font-bold text-church-gold"
            aria-hidden="true"
          >
            {user?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'A'}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-white/40">
              {t('admin.shell.account')}
            </span>
            <span className="block truncate text-xs font-medium text-white/80" title={user?.email}>
              {user?.email}
            </span>
          </span>
          <button
            onClick={handleLogout}
            aria-label={t('admin.signOut')}
            title={t('admin.signOut')}
            className="inline-grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-church-gold"
          >
            <ArrowRightOnRectangleIcon className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useLanguage();
  const location = useLocation();
  const mainRef = useRef(null);
  const menuBtnRef = useRef(null);

  const current = ALL_ITEMS.find(i => location.pathname.startsWith(i.match));
  const currentGroup = current ? NAV_GROUPS.find(g => g.items.includes(current)) : null;

  // Reset scroll on route change so pages never start mid-scroll
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [location.pathname]);

  // Close the mobile drawer on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Return focus to the trigger when the drawer closes
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !sidebarOpen) {
      menuBtnRef.current?.focus({ preventScroll: true });
    }
    wasOpen.current = sidebarOpen;
  }, [sidebarOpen]);

  const pageTitle = current ? t(`admin.nav.${current.key}`) : t('admin.nav.dashboard');

  return (
    <div className="admin-shell">

      {/* Desktop sidebar */}
      <aside className="admin-sidebar">
        <Sidebar />
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true" aria-label={t('admin.shell.root')}>
          <div
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="admin-drawer">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main column — no overflow-hidden here so sticky topbar works correctly */}
      <div className="flex min-w-0 flex-1 flex-col">

        <header className="admin-topbar">
          <button
            ref={menuBtnRef}
            className="inline-grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-church-border bg-white text-church-blue transition-colors hover:bg-church-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-church-gold lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label={t('admin.shell.openMenu')}
            aria-expanded={sidebarOpen}
          >
            <Bars3Icon className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="min-w-0 flex-1">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
              <span className="admin-crumb">{t('admin.shell.root')}</span>
              {currentGroup && (
                <>
                  <ChevronRightIcon className="h-3 w-3 shrink-0 text-gray-300" aria-hidden="true" />
                  <span className="admin-crumb truncate text-church-blue/65">
                    {t(`admin.nav.${currentGroup.key}`)}
                  </span>
                </>
              )}
            </nav>
            <h1 className="admin-header-title">{pageTitle}</h1>
          </div>

          <div className="shrink-0 lg:hidden">
            <LanguageSwitcher />
          </div>
        </header>

        <main ref={mainRef} className="admin-main animate-fade-in">
          <div className="admin-container">{children}</div>
        </main>
      </div>
    </div>
  );
}
