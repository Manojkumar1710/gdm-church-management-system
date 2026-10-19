import { Link } from 'react-router-dom';
import Reveal from './motion/Reveal';
import { CHURCH_NAME } from '../config/church';
import { useLanguage } from '../context/LanguageContext';

const QUICK_KEYS = [
  ['nav.events',      '/events'],
  ['nav.photos',      '/photos'],
  ['nav.sermons',     '/sermons'],
  ['nav.gallery',     '/gallery'],
  ['nav.sundaySchool','/sunday-school'],
  ['footer.prayerRequest', '/prayer'],
  ['nav.contact',     '/contact'],
];

export default function Footer() {
  const year = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="bg-navy-950 text-white" aria-label="Site footer">

      {/* ── Main grid ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">

          {/* Brand column */}
          <Reveal>
            <div>
              <p
                className="text-xl font-bold mb-4 flex items-center gap-2.5 text-white"
                style={{ fontFamily: 'Lora, Georgia, serif' }}
              >
                <span className="text-church-gold text-2xl">✝</span>
                {CHURCH_NAME}
              </p>
              <p className="text-white/55 text-sm leading-relaxed max-w-xs">
                {t('footer.tagline')}
              </p>

              <Link
                to="/offerings"
                className="mt-6 inline-flex items-center gap-2 btn-gold btn-sm rounded-xl"
              >
                {t('nav.giveOffering')}
              </Link>
            </div>
          </Reveal>

          {/* Quick links */}
          <Reveal delay={0.08}>
            <div>
              <h3 className="font-semibold text-church-gold text-xs uppercase tracking-widest mb-5">
                {t('footer.quickLinks')}
              </h3>
              <ul className="space-y-3">
                {QUICK_KEYS.map(([key, to]) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-white/55 text-sm hover:text-white transition-colors
                                 flex items-center gap-2 group"
                    >
                      <span
                        className="text-church-gold/50 group-hover:text-church-gold
                                   transition-colors text-xs"
                        aria-hidden="true"
                      >
                        ›
                      </span>
                      {t(key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Contact */}
          <Reveal delay={0.16}>
            <div>
              <h3 className="font-semibold text-church-gold text-xs uppercase tracking-widest mb-5">
                {t('footer.connectWith')}
              </h3>

              <ul className="space-y-3 text-sm text-white/55">
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 shrink-0" aria-hidden="true">📍</span>
                  <span>GDM Church, Chopparamma Gudem,<br />Koyyalagudem — 534312</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span aria-hidden="true">📞</span>
                  <a
                    href="tel:9494154193"
                    className="hover:text-white transition-colors"
                  >
                    9494154193
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <span aria-hidden="true">✉️</span>
                  <a
                    href="mailto:Gdmchrg@gmail.com"
                    className="hover:text-white transition-colors break-all"
                  >
                    Gdmchrg@gmail.com
                  </a>
                </li>
              </ul>

              {/* Service time chip */}
              <div className="mt-6 inline-flex items-center gap-2.5 px-4 py-2.5
                              bg-white/5 border border-white/10 rounded-xl text-sm">
                <span className="text-church-gold text-base" aria-hidden="true">🕊</span>
                <div>
                  <p className="font-semibold text-white/80 leading-tight">{t('footer.sundayService')}</p>
                  <p className="text-white/45 text-xs">{t('footer.everySunday')}</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── Bottom bar ──────────────────────────────────── */}
      <div className="border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4
                        flex flex-col sm:flex-row items-center justify-between
                        gap-2 text-xs text-white/30">
          <span>© {year} {CHURCH_NAME}. {t('footer.rights')}</span>
          <Link
            to="/admin/login"
            className="hover:text-white/60 transition-colors"
          >
            {t('footer.adminLogin')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
