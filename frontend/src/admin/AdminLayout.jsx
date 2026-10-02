import { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon, CalendarIcon, PhotoIcon, UserGroupIcon, BookOpenIcon,
  PlayIcon, RectangleGroupIcon, BanknotesIcon, HandRaisedIcon,
  EnvelopeIcon, AcademicCapIcon, Bars3Icon, XMarkIcon,
  ArrowRightOnRectangleIcon, ChevronLeftIcon, GlobeAltIcon,
} from '@heroicons/react/24/outline';

const NAV_GROUPS = [
  {
    label: 'Content',
    items: [
      { label: 'Dashboard',     to: '/admin/dashboard',             icon: HomeIcon },
      { label: 'Events',        to: '/admin/events',                icon: CalendarIcon },
      { label: 'Event Photos',  to: '/admin/event-photos',          icon: PhotoIcon },
      { label: 'Pastors',       to: '/admin/pastors',               icon: UserGroupIcon },
      { label: 'Schedule',      to: '/admin/pastor-schedule',       icon: CalendarIcon },
      { label: 'Sermons',       to: '/admin/sermons',               icon: BookOpenIcon },
      { label: 'YouTube',       to: '/admin/youtube',               icon: PlayIcon },
      { label: 'Gallery',       to: '/admin/gallery',               icon: RectangleGroupIcon },
    ],
  },
  {
    label: 'Community',
    items: [
      { label: 'Offerings',     to: '/admin/offerings',             icon: BanknotesIcon },
      { label: 'Prayer Requests',to: '/admin/prayer-requests',      icon: HandRaisedIcon },
      { label: 'Messages',      to: '/admin/contact-messages',      icon: EnvelopeIcon },
      { label: 'Sunday School', to: '/admin/sunday-school/children',icon: AcademicCapIcon },
    ],
  },
];

function NavItem({ label, to, icon: Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
          isActive
            ? 'bg-white/15 text-white shadow-sm'
            : 'text-white/60 hover:bg-white/8 hover:text-white/90'
        }`
      }
    >
      <Icon className="h-4.5 w-4.5 shrink-0" style={{ width: '18px', height: '18px' }} />
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

function Sidebar({ onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
    onClose?.();
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'linear-gradient(180deg, #1e3a5f 0%, #162d4a 100%)' }}>

      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="text-church-gold text-xl">✝</span>
          <div>
            <p className="text-white font-bold text-sm leading-tight" style={{ fontFamily: 'Lora, Georgia, serif' }}>GDM Church</p>
            <p className="text-white/40 text-xs">Admin Panel</p>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10">
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p className="text-white/30 text-xs font-semibold uppercase tracking-widest px-3 mb-1.5">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(item => (
                <NavItem key={item.to} {...item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-4 py-4 border-t border-white/10 space-y-2">
        {/* View site */}
        <Link
          to="/"
          target="_blank"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-white/50 text-xs hover:bg-white/8 hover:text-white/80 transition-colors"
        >
          <GlobeAltIcon className="h-4 w-4" />
          View Public Site
        </Link>

        {/* User + logout */}
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-church-gold/30 flex items-center justify-center text-church-gold font-bold text-xs shrink-0">
            {user?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/70 text-xs font-medium truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/10 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Page title from nav items
  const allItems = NAV_GROUPS.flatMap(g => g.items);
  const current  = allItems.find(i => location.pathname.startsWith(i.to));

  return (
    <div className="flex h-screen bg-[#f5f7fb] overflow-hidden">

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-col flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 flex-shrink-0 flex flex-col shadow-2xl">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Topbar */}
        <header className="bg-white border-b border-gray-200/80 h-14 flex items-center px-4 gap-3 shrink-0 shadow-sm">
          <button
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 min-w-0">
            <span className="hidden sm:inline text-church-blue font-semibold">GDM Admin</span>
            {current && (
              <>
                <span className="hidden sm:inline text-gray-300">/</span>
                <span className="text-gray-700 font-medium truncate">{current.label}</span>
              </>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
