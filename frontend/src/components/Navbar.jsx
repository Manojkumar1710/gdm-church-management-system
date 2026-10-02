import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const NAV = [
  { label: 'Home',         to: '/',            end: true },
  { label: 'About',        to: '/about' },
  { label: 'Events',       to: '/events' },
  { label: 'Photos',       to: '/photos' },
  { label: 'Pastors',      to: '/pastors' },
  { label: 'Sermons',      to: '/sermons' },
  { label: 'Gallery',      to: '/gallery' },
  { label: 'Sunday School',to: '/sunday-school' },
  { label: 'Contact',      to: '/contact' },
];

export default function Navbar() {
  const [open,     setOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Add shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`bg-church-blue text-white sticky top-0 z-50 transition-shadow duration-200 ${scrolled ? 'shadow-xl' : 'shadow-md'}`}>

      {/* ── Desktop bar ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 text-lg font-bold tracking-wide shrink-0"
            style={{ fontFamily: 'Lora, Georgia, serif' }}
          >
            <span className="text-church-gold text-2xl leading-none">✝</span>
            <span className="text-white">GDM Church</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-0.5">
            {NAV.map(({ label, to, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}

            {/* Give CTA */}
            <Link
              to="/offerings"
              className="ml-3 btn-gold btn-sm rounded-lg font-semibold"
            >
              💛 Give
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setOpen(v => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open
              ? <XMarkIcon  className="h-6 w-6" />
              : <Bars3Icon  className="h-6 w-6" />
            }
          </button>
        </div>
      </div>

      {/* ── Mobile menu ─────────────────────────────────── */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{ background: 'rgba(14,27,44,0.98)', backdropFilter: 'blur(8px)' }}
      >
        <div className="px-4 pb-5 pt-2 space-y-1">
          {NAV.map(({ label, to, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {label}
            </NavLink>
          ))}

          <div className="pt-2 pb-1">
            <Link
              to="/offerings"
              className="flex items-center justify-center gap-2 w-full btn-gold rounded-xl py-3 text-sm font-semibold"
            >
              💛 Give an Offering
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
