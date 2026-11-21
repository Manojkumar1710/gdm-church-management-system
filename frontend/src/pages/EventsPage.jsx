import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { eventService } from '../services/eventService';
import Stagger, { StaggerItem } from '../components/motion/Stagger';
import AnimatedText from '../components/motion/AnimatedText';
import { CalendarIcon, ExclamationTriangleIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useLanguage } from '../context/LanguageContext';
import { localized } from '../utils/localized';
import eventsImg from '../assets/images/events.jpg';

const EASE = [0.22, 1, 0.36, 1];

const EVENTS_STYLES = `
.events-page .events-hero-bg {
  background-size: cover;
  background-position: center 42%;
  background-repeat: no-repeat;
  transform-origin: 62% center;
  animation: eventsHeroZoom 12s cubic-bezier(0.22, 1, 0.36, 1) 0s infinite alternate;
  will-change: transform;
}
@keyframes eventsHeroZoom {
  from { transform: scale(1.02); }
  to { transform: scale(1.07); }
}
.events-page .events-hero-overlay {
  background: linear-gradient(to right, rgba(8, 24, 39, 0.82) 0%, rgba(8, 24, 39, 0.68) 42%, rgba(8, 24, 39, 0.30) 100%);
}
.events-page .events-hero-title {
  text-shadow: 0 2px 18px rgba(8, 24, 39, 0.45);
}
.events-page .events-hero-subtitle {
  text-shadow: 0 1px 12px rgba(8, 24, 39, 0.42);
}
@media (prefers-reduced-motion: reduce) {
  .events-page .events-hero-bg {
    animation: none !important;
    transform: none !important;
  }
}
`;

export default function EventsPage() {
  const { t, dateLocale, lang } = useLanguage();
  const reduced = useReducedMotion();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const load = (p = 0) => {
    setLoading(true); setLoadFailed(false);
    eventService.list(p, 12)
      .then(r => {
        const data = r.data.data;
        setEvents(data.content);
        setTotalPages(data.totalPages);
        setPage(p);
      })
      .catch(() => setLoadFailed(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(0), []);

  const gridClass = events.length === 1
    ? 'sm:grid-cols-1 lg:grid-cols-1'
    : events.length === 2
      ? 'sm:grid-cols-2 lg:grid-cols-2'
      : 'sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className="events-page min-h-screen overflow-hidden bg-[#FCF9F2]">
      <style>{EVENTS_STYLES}</style>
      <section
        className="relative isolate overflow-hidden border-b border-[#D2AD4D]/20"
        style={{ backgroundColor: '#081827' }}
      >
        <div
          className="events-hero-bg pointer-events-none absolute inset-0 -z-20"
          style={{ backgroundImage: `url(${eventsImg})` }}
          aria-hidden="true"
        />
        <div className="events-hero-overlay pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
        <motion.div
          className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-[#081827]/45 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-sm backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D2AD4D]" aria-hidden="true" />
            <AnimatedText text={t('events.title')} lang={lang} inline />
          </div>

          <h1 className="events-hero-title max-w-3xl font-serif text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            <AnimatedText text={t('events.heroTitle')} lang={lang} />
          </h1>

          <motion.p
            className="events-hero-subtitle mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base"
            style={lang === 'te' ? { lineHeight: 1.95 } : undefined}
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.5, ease: EASE }}
          >
            {t('events.heroSubtitle')}
          </motion.p>

          <div className="mt-7 h-px w-24 bg-[#D2AD4D]" />
        </motion.div>
      </section>

      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-12 lg:px-8">
        {loading ? (
          <div className={`grid grid-cols-1 gap-6 ${gridClass}`}>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-[340px] animate-pulse overflow-hidden rounded-2xl border border-[#203E63]/10 bg-white shadow-card" aria-hidden="true">
                <div className="aspect-[16/10] bg-[#D2AD4D]/15" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-20 rounded-full bg-[#D2AD4D]/20" />
                  <div className="h-4 w-3/4 rounded bg-[#203E63]/10" />
                  <div className="h-3 w-1/2 rounded bg-[#203E63]/10" />
                </div>
              </div>
            ))}
          </div>
        ) : loadFailed ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#203E63]/10 bg-white px-4 py-16 text-center shadow-card">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#D2AD4D]/30 bg-[#D2AD4D]/10">
              <ExclamationTriangleIcon className="h-8 w-8 text-[#203E63]" aria-hidden="true" />
            </div>
            <p className="font-serif text-lg font-bold text-[#203E63]">{t('events.loadError')}</p>
            <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-[#203E63]/60">{t('common.errorHint')}</p>
            <button
              type="button"
              onClick={() => load(page)}
              className="mt-5 rounded-xl bg-[#203E63] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#D2AD4D] hover:text-[#203E63]"
            >
              {t('common.tryAgain')}
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#203E63]/10 bg-white px-4 py-16 text-center shadow-card">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#D2AD4D]/30 bg-[#D2AD4D]/10">
              <CalendarIcon className="h-8 w-8 text-[#203E63]" aria-hidden="true" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#203E63]">{t('events.noEvents')}</h3>
            <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-[#203E63]/60">{t('events.checkBack')}</p>
          </div>
        ) : (
          <>
            <Stagger className={`grid grid-cols-1 gap-6 ${gridClass}`} staggerDelay={0.08}>
              {events.map(event => {
                const title = localized(event, 'title', lang);
                const location = localized(event, 'location', lang);
                const statusLabel = event.status ? t(`admin.status.${event.status}`) : '';
                const displayStatus = statusLabel.startsWith('admin.status.') ? event.status : statusLabel;
                const badgeClass = event.status === 'COMPLETED'
                  ? 'border-[#203E63]/15 bg-white/90 text-[#203E63]/70'
                  : 'border-[#D2AD4D]/40 bg-[#D2AD4D]/20 text-[#203E63]';

                return (
                  <StaggerItem key={event.id} className="h-full">
                    <Link
                      to={`/events/${event.id}`}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#203E63]/10 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-[#D2AD4D]/40 hover:shadow-card-hover motion-reduce:hover:translate-y-0"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-[#FCF9F2]">
                        {event.imageUrl ? (
                          <img
                            src={event.imageUrl}
                            alt={title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[#FCF9F2]">
                            <CalendarIcon className="h-12 w-12 text-[#D2AD4D]/60" aria-hidden="true" />
                          </div>
                        )}
                        {displayStatus && (
                          <span className={`absolute left-4 top-4 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] shadow-sm backdrop-blur-sm ${badgeClass}`}>
                            {displayStatus}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col p-5 sm:p-6">
                        <h3 className="line-clamp-2 font-serif text-lg font-bold leading-snug text-[#203E63]">
                          {title}
                        </h3>

                        <div className="mt-auto space-y-2 pt-5">
                          {event.eventDate && (
                            <div className="flex items-center gap-2 text-xs font-medium leading-relaxed text-[#203E63]/65">
                              <CalendarIcon className="h-4 w-4 shrink-0 text-[#D2AD4D]" aria-hidden="true" />
                              <span>
                                {new Date(`${event.eventDate}T00:00:00`).toLocaleDateString(dateLocale, {
                                  day: 'numeric', month: 'long', year: 'numeric'
                                })}
                              </span>
                            </div>
                          )}

                          {location && (
                            <div className="flex items-start gap-2 text-xs font-medium leading-relaxed text-[#203E63]/65">
                              <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#D2AD4D]" aria-hidden="true" />
                              <span>{location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </StaggerItem>
                );
              })}
            </Stagger>

            {totalPages > 1 && (
              <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label={t('events.title')}>
                <button
                  onClick={() => load(page - 1)}
                  disabled={page === 0}
                  className="inline-flex h-10 items-center rounded-xl border border-[#203E63]/15 bg-white px-4 text-sm font-semibold text-[#203E63] transition-colors hover:border-[#D2AD4D]/50 hover:bg-[#D2AD4D]/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t('common.prev')}
                </button>
                <span className="inline-flex h-10 items-center rounded-xl bg-[#203E63] px-4 text-sm font-semibold text-white">
                  {t('common.page')} {page + 1} {t('common.of')} {totalPages}
                </span>
                <button
                  onClick={() => load(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="inline-flex h-10 items-center rounded-xl border border-[#203E63]/15 bg-white px-4 text-sm font-semibold text-[#203E63] transition-colors hover:border-[#D2AD4D]/50 hover:bg-[#D2AD4D]/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t('common.next')}
                </button>
              </nav>
            )}
          </>
        )}
      </main>
    </div>
  );
}
