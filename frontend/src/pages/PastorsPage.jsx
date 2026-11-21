import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { pastorService } from '../services/pastorService';
import { PastorCardSkeleton } from '../components/Skeleton';
import Reveal from '../components/motion/Reveal';
import Stagger, { StaggerItem } from '../components/motion/Stagger';
import AnimatedText from '../components/motion/AnimatedText';
import { CalendarIcon, ClockIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useLanguage } from '../context/LanguageContext';
import { localized } from '../utils/localized';
import doveImg from '../assets/images/dove.png';

const EASE = [0.22, 1, 0.36, 1];

const PASTORS_STYLES = `
.pastors-page .pastor-card {
  transition: transform 320ms cubic-bezier(0.22, 1, 0.36, 1), 
              box-shadow 320ms cubic-bezier(0.22, 1, 0.36, 1),
              border-color 320ms cubic-bezier(0.22, 1, 0.36, 1);
}
.pastors-page .pastor-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 22px 48px rgba(23, 52, 81, 0.14);
  border-color: rgba(201, 168, 76, 0.35);
}
.pastors-page .pastor-photo {
  transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
}
.pastors-page .pastor-card:hover .pastor-photo {
  transform: scale(1.05);
}
.pastors-page .gold-divider {
  animation: goldGlow 3s ease-in-out infinite;
}
.pastors-page .word-animated {
  display: inline-block;
  opacity: 0;
  transform: translateY(10px);
  white-space: pre;
}
.pastors-page .word-reveal.is-visible .word-animated {
  animation: wordRevealAnim 450ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes goldGlow {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}
@keyframes wordRevealAnim {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .pastors-page .pastor-card,
  .pastors-page .pastor-photo,
  .pastors-page .gold-divider,
  .pastors-page .word-animated {
    transition: none !important;
    animation: none !important;
  }
  .pastors-page .word-animated {
    opacity: 1 !important;
    transform: none !important;
  }
  .pastors-page .pastor-card:hover {
    transform: none !important;
  }
  .pastors-page .pastor-card:hover .pastor-photo {
    transform: none !important;
  }
}
`;

function GoldDivider({ className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <span className="gold-divider h-px w-16 bg-church-gold/70" />
      <span className="text-base leading-none text-church-gold">✦</span>
      <span className="gold-divider h-px w-16 bg-church-gold/70" />
    </div>
  );
}

function Eyebrow({ children, className = '' }) {
  return (
    <p className={`text-[11px] font-bold uppercase tracking-[0.24em] text-church-gold ${className}`}>
      {children}
    </p>
  );
}

function useInViewOnce(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || inView) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setInView(true);
        observer.disconnect();
      }
    }, { threshold });

    observer.observe(node);
    return () => observer.disconnect();
  }, [inView, threshold]);

  return [ref, inView];
}

function WordAnimatedText({ text, className = '', baseDelay = 0, stagger = 0.12 }) {
  const [ref, inView] = useInViewOnce(0.15);
  const words = useMemo(() => String(text).split(/(\s+)/).filter(Boolean), [text]);

  let wordIndex = 0;
  const content = words.map((word, index) => {
    if (/^\s+$/.test(word)) {
      return ' ';
    }
    const delay = baseDelay + wordIndex * stagger;
    wordIndex += 1;
    return (
      <span
        key={`word-${index}`}
        className="word-animated"
        style={{ animationDelay: `${delay.toFixed(3)}s` }}
      >
        {word}
      </span>
    );
  });

  return (
    <span ref={ref} className={`word-reveal ${inView ? 'is-visible' : ''} ${className}`}>
      {content}
    </span>
  );
}

function PastorCard({ pastor, t, lang }) {
  const bio = localized(pastor, 'bio', lang);
  const village = localized(pastor, 'village', lang);

  return (
    <article className="pastor-card flex h-full flex-col rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_12px_32px_rgba(23,52,81,0.08)] sm:p-8">
      <div className="flex flex-col items-center text-center">
        {pastor.photoUrl ? (
          <div className="mb-5 overflow-hidden rounded-full border-[3px] border-church-gold/40 shadow-[0_0_0_8px_rgba(201,168,76,0.08)]">
            <img
              src={pastor.photoUrl}
              alt={pastor.name}
              className="pastor-photo h-28 w-28 object-cover"
              loading="lazy"
              width={112}
              height={112}
            />
          </div>
        ) : (
          <div className="mb-5 grid h-28 w-28 place-items-center rounded-full border-[3px] border-church-gold/40 bg-[#173451] font-serif text-3xl font-bold text-white shadow-[0_0_0_8px_rgba(201,168,76,0.08)]">
            {pastor.name.charAt(0)}
          </div>
        )}

        <Eyebrow>{t('pastors.pastor')}</Eyebrow>
        <h3 className="mt-2 font-serif text-xl font-bold leading-snug text-[#173451] sm:text-2xl">
          {pastor.name}
        </h3>

        {village && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-[#173451]/60">
            <MapPinIcon className="h-4 w-4 shrink-0 text-church-gold" aria-hidden="true" />
            {village}
          </p>
        )}
      </div>

      {bio && (
        <p className="mt-5 line-clamp-4 text-center text-sm leading-7 text-[#334155]">
          {bio}
        </p>
      )}

      {pastor.contactPublic && pastor.contactNumber && (
        <div className="mt-auto flex justify-center pt-6">
          <a
            href={`tel:${pastor.contactNumber}`}
            className="inline-flex items-center gap-2 rounded-xl border border-church-gold/40 bg-church-gold/10 px-5 py-2.5 text-sm font-semibold text-[#173451] transition-all duration-200 hover:bg-church-gold hover:text-white"
          >
            <PhoneIcon className="h-4 w-4" aria-hidden="true" />
            {t('pastors.call')}
          </a>
        </div>
      )}
    </article>
  );
}

function EmptyStateSection({ t }) {
  return (
    <div className="mx-auto max-w-xl rounded-[1.75rem] border border-church-gold/20 bg-white px-8 py-14 text-center shadow-[0_12px_32px_rgba(23,52,81,0.08)]">
      <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full bg-church-gold/10">
        <img src={doveImg} alt="" className="h-12 w-12 object-contain" aria-hidden="true"
               style={{ filter: 'sepia(1) saturate(3) hue-rotate(5deg) brightness(0.85)' }} />
      </div>
      <h3 className="font-serif text-xl font-bold text-[#173451]">{t('pastors.noPastors')}</h3>
      <p className="mt-3 text-sm leading-7 text-[#334155]">
        Pastor profiles will appear here once added.
      </p>
    </div>
  );
}

export default function PastorsPage() {
  const { t, lang, dateLocale } = useLanguage();
  const reduced = useReducedMotion();
  const [pastors, setPastors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);

  useEffect(() => {
    pastorService.list()
      .then(res => setPastors(res.data.data || []))
      .catch(() => setPastors([]))
      .finally(() => setLoading(false));

    pastorService.getSchedule()
      .then(res => setSchedule(res.data.data || []))
      .catch(() => setSchedule([]))
      .finally(() => setScheduleLoading(false));
  }, []);

  return (
    <div className="pastors-page min-h-screen bg-[#F7F5F0]">
      <style>{PASTORS_STYLES}</style>

      {/* Hero Section */}
      <section className="bg-[#F7F5F0] px-4 py-16 sm:px-6 sm:py-18 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-church-gold/15 shadow-[0_0_0_10px_rgba(201,168,76,0.08)]">
              <img src={doveImg} alt="" className="h-10 w-10 object-contain" aria-hidden="true"
                   style={{ filter: 'sepia(1) saturate(3) hue-rotate(5deg) brightness(0.85)' }} />
            </div>
          </motion.div>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
          >
            <Eyebrow className="text-center">
              <WordAnimatedText text="SHEPHERDS OF FAITH" baseDelay={0} stagger={0.12} />
            </Eyebrow>
          </motion.div>

          <h1 className="mt-4 font-serif text-[1.55rem] font-bold leading-tight text-[#173451] sm:text-[1.95rem] lg:text-[2.25rem]">
            <AnimatedText 
              text={t('pastors.heroMainHeading')} 
              lang={lang}
              stagger={0.045}
            />
          </h1>

          <motion.p
            className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-[#334155] sm:text-base"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
          >
            <WordAnimatedText 
              text="Dedicated shepherds serving our congregation with faith, love and devotion." 
              baseDelay={0.2} 
              stagger={0.12} 
            />
          </motion.p>

          <motion.div
            initial={reduced ? false : { opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
          >
            <GoldDivider className="mt-7" />
          </motion.div>
        </div>
      </section>

      {/* Pastors Gallery Section */}
      <section className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => <PastorCardSkeleton key={i} />)}
            </div>
          ) : pastors.length === 0 ? (
            <EmptyStateSection t={t} />
          ) : (
            <Stagger className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" staggerDelay={0.12}>
              {pastors.map(pastor => (
                <StaggerItem key={pastor.id} className="h-full">
                  <PastorCard pastor={pastor} t={t} lang={lang} />
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </section>

      {/* ── View Schedule ─────────────────────────────────────────── */}
      {(scheduleLoading || schedule.length > 0) && (
        <section className="px-4 pb-14 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <div className="mb-6 flex items-center gap-3">
                <CalendarIcon className="h-5 w-5 text-church-gold shrink-0" aria-hidden="true" />
                <h2 className="font-serif text-xl font-bold text-[#173451] sm:text-2xl">
                  {t('pastors.upcomingSchedule') || 'Upcoming Schedule'}
                </h2>
              </div>
            </Reveal>

            {scheduleLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white" />
                ))}
              </div>
            ) : (
              <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.08}>
                {schedule.slice(0, 9).map(item => {
                  const date = item.serviceDate
                    ? new Date(`${item.serviceDate}T00:00:00`).toLocaleDateString(dateLocale, {
                        weekday: 'short', day: 'numeric', month: 'short',
                      })
                    : '';
                  const timeStr = item.startTime
                    ? item.endTime
                      ? `${item.startTime} – ${item.endTime}`
                      : item.startTime
                    : '';

                  return (
                    <StaggerItem key={item.id}>
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_16px_rgba(23,52,81,0.06)]">
                        <div className="flex items-start gap-3">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-church-gold/10 text-church-gold">
                            <CalendarIcon className="h-5 w-5" aria-hidden="true" />
                          </div>
                          <div className="min-w-0 flex-1">
                            {item.pastorName && (
                              <p className="text-xs font-bold uppercase tracking-[0.14em] text-church-gold">
                                {item.pastorName}
                              </p>
                            )}
                            {item.serviceType && (
                              <p className="font-serif text-base font-semibold text-[#173451] leading-snug mt-0.5">
                                {item.serviceType}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#173451]/65">
                              {date && (
                                <span className="flex items-center gap-1">
                                  <CalendarIcon className="h-3.5 w-3.5 text-church-gold" aria-hidden="true" />
                                  {date}
                                </span>
                              )}
                              {timeStr && (
                                <span className="flex items-center gap-1">
                                  <ClockIcon className="h-3.5 w-3.5 text-church-gold" aria-hidden="true" />
                                  {timeStr}
                                </span>
                              )}
                              {item.pastorVillage && (
                                <span className="flex items-center gap-1">
                                  <MapPinIcon className="h-3.5 w-3.5 text-church-gold" aria-hidden="true" />
                                  {item.pastorVillage}
                                </span>
                              )}
                            </div>
                            {item.notes && (
                              <p className="mt-2 text-xs leading-relaxed text-[#334155]/70">{item.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
