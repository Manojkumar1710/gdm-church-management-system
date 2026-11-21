import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { sermonService, youtubeService } from '../services/sermonService';
import { CardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import AnimatedText from '../components/motion/AnimatedText';
import { getYoutubeId, getYoutubeThumbnail } from '../utils/youtube';
import {
  BookOpenIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  UserIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useLanguage } from '../context/LanguageContext';
import { localized } from '../utils/localized';

const EASE = [0.22, 1, 0.36, 1];

function formatDate(value, dateLocale) {
  if (!value) return '';
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(dateLocale, { day: 'numeric', month: 'short', year: 'numeric' });
}

function HeroDivider({ reduced }) {
  return (
    <motion.div
      className="mt-6 flex items-center justify-center gap-3"
      aria-hidden="true"
      initial={reduced ? false : { opacity: 0, scaleX: 0.7 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ duration: 0.7, delay: 0.28, ease: EASE }}
    >
      <span className="h-px w-14 bg-church-gold/60 sm:w-20" />
      <span className="relative h-4 w-4">
        <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-church-gold" />
        <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-church-gold" />
      </span>
      <span className="h-px w-14 bg-church-gold/60 sm:w-20" />
    </motion.div>
  );
}

/* ─── Thumbnail with play overlay ─────────────────────────────── */
function VideoThumbnail({ url, thumbnailUrl, title }) {
  const [imgError, setImgError] = useState(false);
  const thumb = thumbnailUrl || getYoutubeThumbnail(url);

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-church-blue">
      {thumb && !imgError ? (
        <img
          src={thumb}
          alt={title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-church-blue">
          <BookOpenIcon className="h-12 w-12 text-white/20" aria-hidden="true" />
        </div>
      )}
      {/* Play overlay */}
      <span className="absolute inset-0 flex items-center justify-center bg-church-blue/10 transition-colors group-hover:bg-church-blue/25">
        <span className="grid h-12 w-12 place-items-center rounded-full border border-church-gold/60 bg-church-blue/85 text-church-gold shadow-lg transition-all group-hover:scale-110 group-hover:bg-church-gold group-hover:text-church-blue">
          <PlayIcon className="ml-0.5 h-5 w-5" aria-hidden="true" />
        </span>
      </span>
    </div>
  );
}

/* ─── Sermon card — links to detail page ──────────────────────── */
function SermonCard({ s, t, dateLocale, lang }) {
  const title = localized(s, 'title', lang);
  const speaker = localized(s, 'speaker', lang);
  const description = localized(s, 'description', lang);

  return (
    <Link
      to={`/sermons/${s.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-church-gold/20 bg-white/95 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover motion-reduce:hover:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-church-gold"
      aria-label={title}
    >
      <VideoThumbnail url={s.videoUrl} thumbnailUrl={s.thumbnailUrl} title={title} />

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 font-serif text-base font-bold leading-snug text-church-blue transition-colors group-hover:text-church-gold">
          {title}
        </h3>

        <div className="mt-3 space-y-1.5 text-xs text-church-blue/60">
          {s.speaker && (
            <p className="flex items-center gap-1.5">
              <UserIcon className="h-3.5 w-3.5 shrink-0 text-church-gold" aria-hidden="true" />
              <span className="truncate">{speaker}</span>
            </p>
          )}
          {s.sermonDate && (
            <p className="flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-church-gold" aria-hidden="true" />
              {formatDate(s.sermonDate, dateLocale)}
            </p>
          )}
        </div>

        {description && (
          <p
            className="mt-3 text-xs leading-5 text-church-blue/65"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </p>
        )}

        <span className="mt-auto pt-4 text-xs font-semibold text-church-gold flex items-center gap-1 transition-colors group-hover:text-church-blue">
          <PlayIcon className="h-3 w-3" aria-hidden="true" />
          {t('home.watchMessage')}
        </span>
      </div>
    </Link>
  );
}

/* ─── YouTube video card — links to detail page ──────────────── */
function VideoCard({ v, t, dateLocale, lang }) {
  const title = localized(v, 'title', lang);
  const category = localized(v, 'category', lang);
  const description = localized(v, 'description', lang);

  return (
    <Link
      to={`/youtube/${v.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-church-gold/20 bg-white/95 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover motion-reduce:hover:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-church-gold"
      aria-label={title}
    >
      <VideoThumbnail url={v.youtubeUrl} thumbnailUrl={v.thumbnailUrl} title={title} />

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 font-serif text-base font-bold leading-snug text-church-blue transition-colors group-hover:text-church-gold">
          {title}
        </h3>

        <div className="mt-3 space-y-1.5 text-xs text-church-blue/60">
          {v.category && (
            <p className="flex items-center gap-1.5">
              <VideoCameraIcon className="h-3.5 w-3.5 shrink-0 text-church-gold" aria-hidden="true" />
              <span className="truncate">{category}</span>
            </p>
          )}
          {v.publishedDate && (
            <p className="flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-church-gold" aria-hidden="true" />
              {formatDate(v.publishedDate, dateLocale)}
            </p>
          )}
        </div>

        {description && (
          <p
            className="mt-3 text-xs leading-5 text-church-blue/65"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </p>
        )}

        <span className="mt-auto pt-4 text-xs font-semibold text-church-gold flex items-center gap-1 transition-colors group-hover:text-church-blue">
          <PlayIcon className="h-3 w-3" aria-hidden="true" />
          {t('common.openOnYoutube')}
        </span>
      </div>
    </Link>
  );
}

/* ─── Horizontal carousel ─────────────────────────────────────── */
/*
 * Renders items in a scroll container.
 * Card width is controlled via CSS: 1 card mobile, 2 tablet, 3 desktop.
 * Prev/Next buttons scroll by one "card width".
 * Touch swipe is handled natively by overflow-x: auto.
 */
function HorizontalCarousel({ items, renderItem, loading, emptySlot, reduced }) {
  const trackRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateButtons = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateButtons();
    el.addEventListener('scroll', updateButtons, { passive: true });
    const ro = new ResizeObserver(updateButtons);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', updateButtons); ro.disconnect(); };
  }, [items, updateButtons]);

  const scrollBy = useCallback((dir) => {
    const el = trackRef.current;
    if (!el) return;
    // Scroll by the width of one card (the first child)
    const card = el.querySelector('[data-carousel-card]');
    const cardW = card ? card.offsetWidth + 24 : 320; // 24 = gap
    el.scrollBy({ left: dir * cardW, behavior: reduced ? 'auto' : 'smooth' });
  }, [reduced]);

  if (loading) {
    return (
      <div className="flex gap-6 overflow-hidden">
        {[1, 2, 3].map(i => (
          <div key={i} className="w-full shrink-0 sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
            <CardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) return emptySlot;

  return (
    <div className="relative">
      {/* Prev button */}
      <button
        type="button"
        onClick={() => scrollBy(-1)}
        disabled={!canPrev}
        aria-label="Previous"
        className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full border border-church-gold/30 bg-white shadow-card transition-all duration-200 hover:border-church-gold hover:bg-church-gold hover:text-white disabled:pointer-events-none disabled:opacity-30 sm:-left-5 lg:-left-6"
      >
        <ChevronLeftIcon className="h-5 w-5 text-church-blue group-hover:text-white" />
      </button>

      {/* Next button */}
      <button
        type="button"
        onClick={() => scrollBy(1)}
        disabled={!canNext}
        aria-label="Next"
        className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full border border-church-gold/30 bg-white shadow-card transition-all duration-200 hover:border-church-gold hover:bg-church-gold hover:text-white disabled:pointer-events-none disabled:opacity-30 sm:-right-5 lg:-right-6"
      >
        <ChevronRightIcon className="h-5 w-5 text-church-blue" />
      </button>

      {/* Scrollable track */}
      <div
        ref={trackRef}
        className="gdm-carousel-track flex gap-6 overflow-x-auto pb-3"
        style={{
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {items.map((item, idx) => (
          <div
            key={item.id ?? idx}
            data-carousel-card=""
            className="w-[calc(100%-2rem)] shrink-0 sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
            style={{ scrollSnapAlign: 'start' }}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────── */
export default function SermonsPage() {
  const { t, dateLocale, lang } = useLanguage();
  const reduced = useReducedMotion();
  const [sermons, setSermons] = useState([]);
  const [videos, setVideos] = useState([]);
  const [tab, setTab] = useState('sermons');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      sermonService.list(0, 50),
      youtubeService.list(0, 50),
    ]).then(([sRes, yRes]) => {
      if (sRes.status === 'fulfilled') setSermons(sRes.value.data.data?.content || []);
      if (yRes.status === 'fulfilled') setVideos(yRes.value.data.data?.content || []);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { setQuery(''); }, [tab]);

  const source = tab === 'sermons' ? sermons : videos;
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return source;
    return source.filter(item => [
      localized(item, 'title', lang),
      localized(item, 'speaker', lang),
      localized(item, 'category', lang),
      localized(item, 'description', lang),
    ]
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(term)));
  }, [source, query, lang]);

  const tabs = [
    { key: 'sermons', label: t('sermons.tabSermonsLabel'), count: sermons.length },
    { key: 'youtube', label: t('sermons.tabYoutubeLabel'), count: videos.length },
  ];
  const hasQuery = query.trim().length > 0;

  return (
    <div className="min-h-screen bg-church-cream">
      {/* Hero */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-church-gold">
            <AnimatedText text={t('sermons.heroEyebrow')} lang={lang} inline />
          </p>

          <h1 className="mt-4 font-serif text-3xl font-bold leading-tight text-church-blue sm:text-4xl lg:text-5xl">
            <AnimatedText text={t('sermons.title')} lang={lang} />
          </h1>

          <motion.p
            className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-church-blue/70 sm:text-base"
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.18, ease: EASE }}
          >
            {t('sermons.heroSubtitle')}
          </motion.p>

          <HeroDivider reduced={reduced} />
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
        {/* Controls */}
        <div className="mx-auto mb-10 flex w-full max-w-3xl flex-col items-center gap-4 sm:flex-row sm:justify-center">
          {/* Tabs */}
          <div className="flex w-full justify-center gap-1 rounded-2xl border border-church-gold/20 bg-white/80 p-1 shadow-card backdrop-blur-sm sm:w-auto">
            {tabs.map(item => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                aria-pressed={tab === item.key}
                className={`relative rounded-xl px-5 py-2.5 pb-3 text-sm font-semibold transition-all duration-200 ${
                  tab === item.key
                    ? 'bg-white text-church-blue shadow-card ring-1 ring-church-gold/40'
                    : 'text-church-blue/60 hover:bg-church-gold/10 hover:text-church-blue'
                }`}
              >
                {item.label}
                {!loading && item.count > 0 && (
                  <span className="ml-1.5 text-xs text-church-gold">({item.count})</span>
                )}
                {tab === item.key && (
                  <span className="absolute inset-x-5 bottom-1.5 h-0.5 rounded-full bg-church-gold" />
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <label className="relative block w-full sm:max-w-xs">
            <span className="sr-only">{t('sermons.searchLabel')}</span>
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-church-gold" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('sermons.searchPlaceholder')}
              className="w-full rounded-2xl border border-church-gold/20 bg-white/80 py-2.5 pl-10 pr-4 text-sm text-church-blue shadow-card outline-none transition placeholder:text-church-blue/35 focus:border-church-gold/60 focus:ring-2 focus:ring-church-gold/20"
            />
          </label>
        </div>

        {/* Carousel */}
        <div className="px-6 sm:px-8">
          {tab === 'sermons' ? (
            <HorizontalCarousel
              key="sermons"
              items={filtered}
              loading={loading}
              reduced={reduced}
              renderItem={(s) => (
                <SermonCard s={s} t={t} dateLocale={dateLocale} lang={lang} />
              )}
              emptySlot={
                <div className="mx-auto max-w-2xl rounded-3xl border border-church-gold/20 bg-white/80 shadow-card">
                  {hasQuery ? (
                    <EmptyState icon={BookOpenIcon} title={t('sermons.noMatchingSermons')} message={t('sermons.tryDifferentPreacher')} />
                  ) : (
                    <EmptyState icon={BookOpenIcon} title={t('sermons.noSermons')} message={t('sermons.sermonsHere')} />
                  )}
                </div>
              }
            />
          ) : (
            <HorizontalCarousel
              key="youtube"
              items={filtered}
              loading={loading}
              reduced={reduced}
              renderItem={(v) => (
                <VideoCard v={v} t={t} dateLocale={dateLocale} lang={lang} />
              )}
              emptySlot={
                <div className="mx-auto max-w-2xl rounded-3xl border border-church-gold/20 bg-white/80 shadow-card">
                  {hasQuery ? (
                    <EmptyState icon={VideoCameraIcon} title={t('sermons.noMatchingVideos')} message={t('sermons.tryDifferentTerm')} />
                  ) : (
                    <EmptyState icon={VideoCameraIcon} title={t('sermons.noVideos')} message={t('sermons.videosHere')} />
                  )}
                </div>
              }
            />
          )}
        </div>
      </main>
    </div>
  );
}
