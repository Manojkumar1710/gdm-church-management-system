import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { churchService } from '../services/churchService';
import { CHURCH_NAME } from '../config/church';
import Reveal from '../components/motion/Reveal';
import Stagger, { StaggerItem } from '../components/motion/Stagger';
import AnimatedText from '../components/motion/AnimatedText';
import churchImg from '../assets/images/church.jpg';
import { localized } from '../utils/localized';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useLanguage } from '../context/LanguageContext';
import {
  ArrowRightIcon,
  EnvelopeIcon,
  EyeIcon,
  HeartIcon,
  MapPinIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';

const EASE = [0.22, 1, 0.36, 1];

const ABOUT_STYLES = `
.about-page .about-vision-card {
  background: #ffffff;
  transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 300ms cubic-bezier(0.22, 1, 0.36, 1);
}
.about-page .about-vision-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 46px rgba(15, 42, 70, 0.14);
}
.about-page .about-vision-icon {
  transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1), background-color 300ms cubic-bezier(0.22, 1, 0.36, 1), color 300ms cubic-bezier(0.22, 1, 0.36, 1);
}
.about-page .about-vision-card:hover .about-vision-icon {
  transform: translateY(-2px) scale(1.06);
  background-color: #D9E8F6;
  color: #173451;
}
@media (prefers-reduced-motion: reduce) {
  .about-page .about-vision-card,
  .about-page .about-vision-icon {
    transition: none !important;
  }
  .about-page .about-vision-card:hover,
  .about-page .about-vision-card:hover .about-vision-icon {
    transform: none !important;
  }
}
`;

function Eyebrow({ children, className = '' }) {
  return (
    <p className={`text-[11px] font-bold uppercase tracking-[0.22em] text-[#355A82] ${className}`}>
      {children}
    </p>
  );
}

export default function AboutPage() {
  const { t, lang } = useLanguage();
  const reduced = useReducedMotion();
  const [serverInfo, setServerInfo] = useState({});
  const [dataUnavailable, setDataUnavailable] = useState(false);

  const fallbackInfo = useMemo(() => ({
    name: CHURCH_NAME,
    description: t('about.fallbackDescription'),
    history: t('about.fallbackHistory'),
    vision: t('about.fallbackVision'),
    mission: t('about.fallbackMission'),
    address: 'GDM Church, Chopparamma Gudem, Koyyalagudem, West Godavari — 534312',
    phone: '9494154193',
    email: 'Gdmchrg@gmail.com',
  }), [t]);

  const info = { ...fallbackInfo, ...serverInfo };
  const bodyLeading = lang === 'te' ? 'leading-[1.95]' : 'leading-8';

  const load = () => {
    setDataUnavailable(false);
    churchService.getInfo()
      .then(r => {
        const data = r.data?.data;
        if (data && typeof data === 'object') {
          setServerInfo(Object.fromEntries(
            Object.entries(data).filter(([, value]) => value !== null && value !== undefined && value !== '')
          ));
        }
      })
      .catch(() => setDataUnavailable(true));
  };

  useEffect(load, []);

  const mapsUrl = info.mapUrl || (info.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(info.address)}`
    : '');

  return (
    <div className="about-page relative isolate min-h-screen overflow-hidden bg-[#F7F5F0]">
      <style>{ABOUT_STYLES}</style>
      <motion.div
        className="absolute inset-0 -z-20"
        style={{
          backgroundImage: `url(${churchImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 42%',
          filter: 'none',
        }}
        aria-hidden="true"
        initial={reduced ? false : { scale: 1.06 }}
        animate={{ scale: 1.08 }}
        transition={{ duration: 2.4, ease: EASE }}
      />
      <div className="absolute inset-0 -z-10 bg-[#081827]/45" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#081827]/52 via-[#081827]/38 to-[#081827]/48" aria-hidden="true" />

      <main className="relative z-10">
        <section className="mx-auto flex min-h-[52vh] max-w-7xl items-center px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              className="mx-auto mb-6 h-px w-14 bg-white/45"
              initial={reduced ? false : { opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.7, ease: EASE }}
            />

            <h1
              className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
              style={lang === 'te' ? { fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', lineHeight: 1.25 } : undefined}
            >
              <AnimatedText text={t('about.heroTitle')} lang={lang} />
            </h1>

            <motion.p
              className={`mx-auto mt-5 max-w-3xl text-sm text-white/80 sm:text-base ${lang === 'te' ? 'leading-[1.95]' : 'leading-8'}`}
              initial={reduced ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.16, ease: EASE }}
            >
              {t('about.heroSubtitle')}
            </motion.p>

            <motion.div
              className="mx-auto mt-7 h-px w-20 bg-white/35"
              initial={reduced ? false : { opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.28, ease: EASE }}
            />
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-16 lg:px-8">
          {dataUnavailable && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 text-sm text-[#243B55] shadow-sm">
              <span>{t('about.loadError')}</span>
              <button
                type="button"
                onClick={load}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-[#173451] transition-colors hover:bg-slate-100"
              >
                {t('common.tryAgain')}
              </button>
            </div>
          )}

          <section id="our-story" className="scroll-mt-24">
            <Reveal className="text-center">
              <Eyebrow className="!text-white">{t('about.aboutOurChurch')}</Eyebrow>
              <h2 className="mt-2 font-serif text-2xl font-bold text-white sm:text-3xl">
                {t('about.storyTitle')}
              </h2>
            </Reveal>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Reveal delay={0.08}>
                <div className="h-full rounded-[1.75rem] border border-white/80 bg-[#FBF9F4]/95 p-6 shadow-[0_14px_35px_rgba(8,24,39,0.10)] sm:p-8">
                  <Eyebrow>{t('about.aboutOurChurch')}</Eyebrow>
                  <p className={`mt-3 text-sm text-[#334155] sm:text-base ${bodyLeading}`}>
                    {localized(info, 'description', lang)}
                  </p>
                </div>
              </Reveal>

              <Reveal delay={0.16}>
                <div className="h-full rounded-[1.75rem] border border-white/80 bg-[#FBF9F4]/95 p-6 shadow-[0_14px_35px_rgba(8,24,39,0.10)] sm:p-8">
                  <Eyebrow>{t('about.ourHistory')}</Eyebrow>
                  <p className={`mt-3 text-sm text-[#334155] sm:text-base ${bodyLeading}`}>
                    {localized(info, 'history', lang)}
                  </p>
                </div>
              </Reveal>
            </div>
          </section>

          <section className="mt-10 sm:mt-12">
            <Reveal className="text-center">
              <Eyebrow className="!text-white">{t('about.faithPurpose')}</Eyebrow>
              <h2 className="mt-2 font-serif text-2xl font-bold text-white sm:text-3xl">
                {t('about.visionMission')}
              </h2>
            </Reveal>

            <Stagger className="mt-6 grid gap-5 md:grid-cols-2" staggerDelay={0.1}>
              <StaggerItem className="h-full">
                <motion.article
                  className="about-vision-card group flex h-full flex-col rounded-[1.75rem] border border-slate-200 bg-white p-6 text-[#173451] shadow-[0_16px_38px_rgba(15,42,70,0.10)] sm:p-8"
                  initial={reduced ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.75, delay: 0.15, ease: EASE }}
                >
                  <span className="about-vision-icon grid h-11 w-11 place-items-center rounded-xl bg-[#E7EFF7] text-[#203E63]">
                    <EyeIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-serif text-xl font-bold text-[#173451] sm:text-2xl">{t('about.ourVision')}</h3>
                  <p
                    className={`mt-3 text-sm text-[#173451] sm:text-base ${bodyLeading}`}
                    style={lang === 'te' ? { lineHeight: 1.95 } : undefined}
                  >
                    {localized(info, 'vision', lang)}
                  </p>
                  <div className="mt-auto pt-6">
                    <div className="h-px w-16 bg-[#D9E4EF]" aria-hidden="true" />
                  </div>
                </motion.article>
              </StaggerItem>

              <StaggerItem className="h-full">
                <motion.article
                  className="flex h-full flex-col rounded-[1.75rem] border border-slate-200 bg-white p-6 text-[#173451] shadow-[0_18px_45px_rgba(8,24,39,0.10)] sm:p-8"
                  whileHover={reduced ? undefined : { y: -4 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#E7EFF7] text-[#173451]">
                    <HeartIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-serif text-xl font-bold sm:text-2xl">{t('about.ourMission')}</h3>
                  <p className={`mt-3 text-sm text-slate-600 sm:text-base ${bodyLeading}`}>
                    {localized(info, 'mission', lang)}
                  </p>
                  <div className="mt-auto pt-6">
                    <div className="h-px w-16 bg-slate-200" aria-hidden="true" />
                  </div>
                </motion.article>
              </StaggerItem>
            </Stagger>
          </section>

          <section className="mt-10 sm:mt-12">
            <Reveal>
              <div className="rounded-[1.75rem] border border-white/80 bg-[#FBF9F4]/95 p-6 shadow-[0_18px_45px_rgba(8,24,39,0.12)] sm:p-8">
                <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div className="min-w-0">
                    <Eyebrow>{t('about.visitConnect')}</Eyebrow>
                    <h2 className="mt-2 font-serif text-2xl font-bold text-[#173451] sm:text-3xl">
                      {t('contact.findUs')}
                    </h2>
                    <p className="mt-1.5 text-sm text-slate-500">{localized(info, 'name', lang)}</p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {info.address && mapsUrl && (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-[#8FA9C4] hover:bg-[#F4F8FC]"
                        >
                          <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#355A82]" aria-hidden="true" />
                          <span className="min-w-0">
                            <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                              {t('contact.addressLabel')}
                            </span>
                            <span className="mt-1 block text-sm leading-relaxed text-[#243B55]">{info.address}</span>
                          </span>
                        </a>
                      )}

                      {info.phone && (
                        <a
                          href={`tel:${info.phone}`}
                          className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-[#8FA9C4] hover:bg-[#F4F8FC]"
                        >
                          <PhoneIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#355A82]" aria-hidden="true" />
                          <span className="min-w-0">
                            <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                              {t('contact.phoneLabel')}
                            </span>
                            <span className="mt-1 block break-all text-sm leading-relaxed text-[#243B55]">{info.phone}</span>
                          </span>
                        </a>
                      )}

                      {info.email && (
                        <a
                          href={`mailto:${info.email}`}
                          className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-[#8FA9C4] hover:bg-[#F4F8FC] sm:col-span-2"
                        >
                          <EnvelopeIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#355A82]" aria-hidden="true" />
                          <span className="min-w-0">
                            <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                              {t('contact.emailLabel')}
                            </span>
                            <span className="mt-1 block break-all text-sm leading-relaxed text-[#243B55]">{info.email}</span>
                          </span>
                        </a>
                      )}
                    </div>
                  </div>

                  {mapsUrl && (
                    <motion.a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#173451] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(23,52,81,0.25)] transition-colors hover:bg-[#254C73]"
                      whileHover={reduced ? undefined : { y: -2 }}
                      whileTap={reduced ? undefined : { scale: 0.98 }}
                      transition={{ duration: 0.2, ease: EASE }}
                    >
                      {t('contact.getDirections')}
                      <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                    </motion.a>
                  )}
                </div>
              </div>
            </Reveal>
          </section>
        </div>
      </main>
    </div>
  );
}
