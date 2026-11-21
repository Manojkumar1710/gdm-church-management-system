import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { sermonService, youtubeService } from '../services/sermonService';
import { CardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import Reveal from '../components/motion/Reveal';
import Stagger, { StaggerItem } from '../components/motion/Stagger';
import AnimatedText from '../components/motion/AnimatedText';
import { getYoutubeId, getYoutubeThumbnail, getYoutubeEmbed } from '../utils/youtube';
import {
  BookOpenIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  UserIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useLanguage } from '../context/LanguageContext';
import { localized } from '../utils/localized';

const EASE = [0.22, 1, 0.36, 1];
const PAGE_SIZE = 6;

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

function YTThumb({ url, title, fallbackThumb, t }) {
  const embed = getYoutubeEmbed(url);
  const thumb = fallbackThumb || getYoutubeThumbnail(url);

  const [showEmbed, setShowEmbed] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (showEmbed && embed) {
    return (
      <div className="aspect-video w-full overflow-hidden bg-church-blue">
        <iframe
          src={embed}
          className="h-full w-full"
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => embed ? setShowEmbed(true) : window.open(url, '_blank')}
      className="group relative block aspect-video w-full overflow-hidden bg-church-blue"
      aria-label={`${t('common.play')} ${title}`}
    >
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
      <span className="absolute inset-0 flex items-center justify-center bg-church-blue/10 transition-colors group-hover:bg-church-blue/20">
        <span className="grid h-12 w-12 place-items-center rounded-full border border-church-gold/60 bg-church-blue/85 text-church-gold shadow-lg transition-colors group-hover:bg-church-gold group-hover:text-church-blue">
          <PlayIcon className="ml-0.5 h-5 w-5" aria-hidden="true" />
        </span>
      </span>
    </button>
  );
}

function SermonCard({ s, t, dateLocale, lang }) {
  const hasVideo = Boolean(s.videoUrl && getYoutubeId(s.videoUrl));
  const title = localized(s, 'title', lang);
  const speaker = localized(s, 'speaker', lang);
  const description = localized(s, 'description', lang);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-church-gold/20 bg-white/85 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover motion-reduce:hover:translate-y-0">
      {s.videoUrl ? (
        <YTThumb url={s.videoUrl} title={title} fallbackThumb={s.thumbnailUrl} t={t} />
      ) : s.thumbnailUrl ? (
        <div className="aspect-video w-full overflow-hidden bg-church-blue">
          <img src={s.thumbnailUrl} alt={title} loading="lazy" className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center bg-church-blue">
          <BookOpenIcon className="h-12 w-12 text-white/20" aria-hidden="true" />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="line-clamp-2 font-serif text-lg font-bold leading-snug text-church-blue">
          {title}
        </h3>

        <div className="mt-3 space-y-1.5 text-xs text-church-blue/60">
          {s.speaker && (
            <p className="flex items-center gap-1.5">
              <UserIcon className="h-3.5 w-3.5 shrink-0 text-church-gold" aria-hidden="true" />
              {speaker}
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
          <p className="mt-4 line-clamp-2 text-sm leading-7 text-church-blue/70">
            {description}
          </p>
        )}

        {s.videoUrl && !hasVideo && (
          <a
            href={s.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto pt-5 text-xs font-semibold text-church-blue hover:underline"
          >
            {t('common.watchOnYoutube')}
          </a>
        )}
      </div>
    </article>
  );
}

function VideoCard({ v, t, dateLocale, lang }) {
  const title = localized(v, 'title', lang);
  const category = localized(v, 'category', lang);
  const description = localized(v, 'description', lang);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-church-gold/20 bg-white/85 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover motion-reduce:hover:translate-y-0">
      <YTThumb url={v.youtubeUrl} title={title} fallbackThumb={v.thumbnailUrl} t={t} />

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="line-clamp-2 font-serif text-lg font-bold leading-snug text-church-blue">
          {title}
        </h3>

        <div className="mt-3 space-y-1.5 text-xs text-church-blue/60">
          {v.category && (
            <p className="flex items-center gap-1.5">
              <VideoCameraIcon className="h-3.5 w-3.5 shrink-0 text-church-gold" aria-hidden="true" />
              {category}
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
          <p className="mt-4 line-clamp-2 text-sm leading-7 text-church-blue/70">
            {description}
          </p>
        )}

        <a
          href={v.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto pt-5 text-xs font-semibold text-church-blue hover:underline"
        >
          {t('common.openOnYoutube')}
        </a>
      </div>
    </article>
  );
}

export default function SermonsPage() {
  const { t, dateLocale, lang } = useLanguage();
  const reduced = useReducedMotion();
  const [sermons, setSermons] = useState([]);
  const [videos, setVideos] = useState([]);
  const [tab, setTab] = useState('sermons');
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      sermonService.list(0, 20),
      youtubeService.list(0, 20),
    ]).then(([sRes, yRes]) => {
      if (sRes.status === 'fulfilled') setSermons(sRes.value.data.data?.content || []);
      if (yRes.status === 'fulfilled') setVideos(yRes.value.data.data?.content || []);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [tab, query]);

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
  const visible = filtered.slice(0, visibleCount);
  const hasQuery = query.trim().length > 0;

  return (
    <div className="min-h-screen bg-church-cream">
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
        <div className="mx-auto mb-10 flex w-full max-w-3xl flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <div className="flex w-full justify-center gap-1 rounded-2xl border border-church-gold/20 bg-white/80 p-1 shadow-card backdrop-blur-sm sm:w-auto">
            {tabs.map(item => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setTab(item.key);
                  setQuery('');
                }}
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

          <label className="relative block w-full sm:max-w-xs">
            <span className="sr-only">{t('sermons.searchLabel')}</span>
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-church-gold" />
            <input
              type="search"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder={t('sermons.searchPlaceholder')}
              className="w-full rounded-2xl border border-church-gold/20 bg-white/80 py-2.5 pl-10 pr-4 text-sm text-church-blue shadow-card outline-none transition placeholder:text-church-blue/35 focus:border-church-gold/60 focus:ring-2 focus:ring-church-gold/20"
            />
          </label>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-3xl border border-church-gold/20 bg-white/80 shadow-card">
            {hasQuery ? (
              <EmptyState
                icon={tab === 'sermons' ? BookOpenIcon : VideoCameraIcon}
                title={tab === 'sermons' ? t('sermons.noMatchingSermons') : t('sermons.noMatchingVideos')}
                message={tab === 'sermons' ? t('sermons.tryDifferentPreacher') : t('sermons.tryDifferentTerm')}
              />
            ) : tab === 'sermons' ? (
              <EmptyState
                icon={BookOpenIcon}
                title={t('sermons.noSermons')}
                message={t('sermons.sermonsHere')}
              />
            ) : (
              <EmptyState
                icon={VideoCameraIcon}
                title={t('sermons.noVideos')}
                message={t('sermons.videosHere')}
              />
            )}
          </div>
        ) : (
          <>
            <Stagger key={tab} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.07}>
              {visible.map(item => (
                <StaggerItem key={item.id} className="h-full">
                  {tab === 'sermons' ? (
                    <SermonCard s={item} t={t} dateLocale={dateLocale} lang={lang} />
                  ) : (
                    <VideoCard v={item} t={t} dateLocale={dateLocale} lang={lang} />
                  )}
                </StaggerItem>
              ))}
            </Stagger>

            {visibleCount < filtered.length && (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount(count => count + PAGE_SIZE)}
                  className="rounded-full border border-church-gold px-7 py-3 text-sm font-semibold text-church-blue transition-all duration-200 hover:bg-church-gold hover:text-white focus:outline-none focus:ring-2 focus:ring-church-gold/40"
                >
                  {t('common.loadMore')}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
