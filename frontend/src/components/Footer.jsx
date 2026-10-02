import { Link } from 'react-router-dom';

const QUICK = [
  ['Events',       '/events'],
  ['Photos',       '/photos'],
  ['Sermons',      '/sermons'],
  ['Gallery',      '/gallery'],
  ['Sunday School','/sunday-school'],
  ['Prayer Request','/prayer'],
  ['Contact',      '/contact'],
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-church-blue text-white mt-auto">

      {/* ── Main grid ─────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

          {/* Brand */}
          <div>
            <p className="text-xl font-bold mb-3 flex items-center gap-2"
               style={{ fontFamily: 'Lora, Georgia, serif' }}>
              <span className="text-church-gold text-2xl">✝</span>
              GDM Church
            </p>
            <p className="text-white/65 text-sm leading-relaxed max-w-xs">
              Grace, Devotion and Mercy — a welcoming community of believers
              dedicated to worship, fellowship and service.
            </p>

            <Link
              to="/offerings"
              className="mt-5 inline-flex items-center gap-2 btn-gold btn-sm rounded-lg text-xs font-semibold"
            >
              💛 Give an Offering
            </Link>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-church-gold text-sm uppercase tracking-widest mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {QUICK.map(([label, to]) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-white/65 text-sm hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <span className="opacity-40">›</span> {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-church-gold text-sm uppercase tracking-widest mb-4">
              Connect With Us
            </h4>
            <ul className="space-y-2.5 text-sm text-white/65">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">📍</span>
                <span>GDM Church, Village Road, District</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span>
                <span>+91-9999999999</span>
              </li>
              <li className="flex items-center gap-2">
                <span>✉️</span>
                <a href="mailto:info@gdmchurch.org" className="hover:text-white transition-colors">
                  info@gdmchurch.org
                </a>
              </li>
            </ul>

            {/* Sunday service time */}
            <div className="mt-5 p-3 bg-white/5 rounded-xl border border-white/10 text-sm">
              <p className="font-semibold text-white/80 mb-0.5">Sunday Service</p>
              <p className="text-white/55">Every Sunday · 10:00 AM</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40">
          <span>© {year} GDM Church. All rights reserved.</span>
          <Link to="/admin/login" className="hover:text-white/70 transition-colors">
            Admin Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
