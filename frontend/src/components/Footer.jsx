import { Link } from 'react-router-dom';
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import Reveal from './motion/Reveal';
import { CHURCH_NAME } from '../config/church';
import { useLanguage } from '../context/LanguageContext';

const QUICK_KEYS = [
  ['nav.home',        '/'],
  ['nav.about',       '/about'],
  ['nav.events',      '/events'],
  ['nav.photos',      '/photos'],
  ['nav.pastors',     '/pastors'],
  ['nav.sermons',     '/sermons'],
  ['nav.songs',       '/songs'],
  ['nav.gallery',     '/gallery'],
  ['nav.sundaySchool','/sunday-school'],
  ['nav.contact',     '/contact'],
];

const CONNECT_KEYS = [
  ['footer.prayerRequest', '/prayer'],
  ['nav.giveOffering',     '/offerings'],
];

export default function Footer() {
  const year = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="bg-navy-950 text-white" aria-label="Site footer">

      <div className="page-container pb-10 pt-16 sm:pt-20">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">

          <Reveal className="lg:col-span-4">
            <div>
              <p
                className="mb-4 flex items-center gap-2.5 font-serif text-xl font-bold text-white"
                style={{ fontFamily: '"Cinzel Decorative", Cinzel, Georgia, serif' }}
              >
                <span className="text-2xl text-church-gold">✝</span>
                {CHURCH_NAME}
              </p>
              <p className="max-w-xs text-sm leading-relaxed text-white/60">
                {t('footer.tagline')}
              </p>

              <Link
                to="/offerings"
                className="btn-gold mt-6 h-11 px-5"
              >
                {t('nav.giveOffering')} <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="lg:col-span-3">
            <div>
              <h3 className="section-label">{t('footer.quickLinks')}</h3>
              <ul className="space-y-2.5">
                {QUICK_KEYS.map(([key, to]) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="group flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
                    >
                      <span
                        className="text-xs text-church-gold/50 transition-colors group-hover:text-church-gold"
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

          <Reveal delay={0.16} className="lg:col-span-2">
            <div>
              <h3 className="section-label">{t('home.howServe')}</h3>
              <ul className="space-y-2.5">
                {CONNECT_KEYS.map(([key, to]) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {t(key)}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-3.5">
                <p className="text-sm font-semibold text-white/85">
                  {t('footer.sundayService')}
                </p>
                <p className="mt-1 text-xs text-white/50">
                  {t('footer.everySunday')}
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.24} className="lg:col-span-3">
            <div>
              <h3 className="section-label">{t('footer.connectWith')}</h3>
              <ul className="space-y-3.5 text-sm text-white/60">
                <li className="flex items-start gap-2.5">
                  <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-church-gold" aria-hidden="true" />
                  <span>GDM Church, Chopparamma Gudem,<br />Koyyalagudem — 534312</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <PhoneIcon className="h-4 w-4 shrink-0 text-church-gold" aria-hidden="true" />
                  <a
                    href="tel:9494154193"
                    className="transition-colors hover:text-white"
                  >
                    9494154193
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <EnvelopeIcon className="h-4 w-4 shrink-0 text-church-gold" aria-hidden="true" />
                  <a
                    href="mailto:Gdmchrg@gmail.com"
                    className="break-all transition-colors hover:text-white"
                  >
                    Gdmchrg@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="page-container flex flex-col gap-2 py-5 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} {CHURCH_NAME}. {t('footer.rights')}</span>
          <Link
            to="/admin/login"
            className="transition-colors hover:text-white/80"
          >
            {t('footer.adminLogin')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
