import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { songService } from '../services/songService';
import { Skeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import Reveal from '../components/motion/Reveal';
import Stagger, { StaggerItem } from '../components/motion/Stagger';
import AnimatedText from '../components/motion/AnimatedText';
import heroBibleImg from '../assets/images/hero-bible.jpg';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useLanguage } from '../context/LanguageContext';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  MusicalNoteIcon,
  PlayIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const PAGE_SIZE = 10;
const ALL_CATEGORIES = '__all__';
const EASE = [0.22, 1, 0.36, 1];

const NOTES = [
  { className: 'left-[7%] top-[24%] h-8 w-8 text-church-gold/25', rotate: -14, delay: 0, duration: 10, drift: 12 },
  { className: 'right-[10%] top-[18%] h-10 w-10 text-white/15', rotate: 12, delay: 1.2, duration: 12, drift: 15 },
  { className: 'right-[22%] bottom-[16%] h-7 w-7 text-church-gold/20', rotate: -8, delay: 2.1, duration: 11, drift: 10 },
  { className: 'left-[18%] bottom-[12%] h-9 w-9 text-white/10', rotate: 18, delay: 0.7, duration: 13, drift: 14 },
];

function getCategories(songs) {
  const categories = new Map();
  songs.forEach((song) => {
    const category = (song.category || 'General').trim() || 'General';
    if (!categories.has(category.toLowerCase())) categories.set(category.toLowerCase(), category);
  });
  return Array.from(categories.values()).sort((a, b) => a.localeCompare(b));
}

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const pages = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push('start-ellipsis');
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < total - 1) pages.push('end-ellipsis');
  pages.push(total);

  return pages;
}

export default function SongList() {
  const { t, lang } = useLanguage();
  const reduced = useReducedMotion();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    songService
      .list('')
      .then((r) => {
        if (active) setSongs(r.data.data || []);
      })
      .catch(() => {
        if (active) setSongs([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => getCategories(songs), [songs]);

  const filteredSongs = useMemo(() => {
    const query = debouncedSearch.trim().toLocaleLowerCase();
    return songs.filter((song) => {
      const category = (song.category || 'General').trim() || 'General';
      const matchesCategory = selectedCategory === ALL_CATEGORIES || category === selectedCategory;
      const titleTe = (song.titleTe || '').toLocaleLowerCase();
      const titleEn = (song.titleEn || '').toLocaleLowerCase();
      const number = String(song.songNumber ?? '').toLocaleLowerCase();
      const matchesSearch = !query || titleTe.includes(query) || titleEn.includes(query) || number.includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [songs, debouncedSearch, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredSongs.length / PAGE_SIZE));
  const currentSongs = filteredSongs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = search.trim() !== '' || selectedCategory !== ALL_CATEGORIES;
  const resultLabel = filteredSongs.length === 1
    ? t('songs.resultCountSingular', { count: filteredSongs.length })
    : t('songs.resultCountPlural', { count: filteredSongs.length });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategory]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setSelectedCategory(ALL_CATEGORIES);
    setPage(1);
  };

  const goToPage = (nextPage) => {
    const clamped = Math.min(Math.max(nextPage, 1), totalPages);
    if (clamped !== page) setPage(clamped);
  };

  return (
    <div className="overflow-hidden bg-church-cream">
      <section className="relative isolate overflow-hidden bg-church-blue text-white">
        <motion.img
          src={heroBibleImg}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center"
          initial={reduced ? false : { scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.4, ease: EASE }}
        />
        <div className="absolute inset-0 bg-church-blue/80" aria-hidden="true" />

        {NOTES.map((note, index) => (
          <motion.div
            key={index}
            aria-hidden="true"
            className={`pointer-events-none absolute ${note.className}`}
            animate={reduced ? undefined : { y: [0, -note.drift, 0], rotate: [note.rotate, note.rotate + 8, note.rotate] }}
            transition={{ duration: note.duration, delay: note.delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            <MusicalNoteIcon className="h-full w-full" />
          </motion.div>
        ))}

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <motion.div
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-church-gold"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <MusicalNoteIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {t('songs.title')}
          </motion.div>

          <h1 className="font-serif text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            <AnimatedText text={t('songs.heroTitle')} lang={lang} />
          </h1>

          <motion.p
            className="mt-5 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
          >
            {t('songs.heroSubtitle')}
          </motion.p>

          <motion.div
            className="mt-8 h-px w-24 bg-church-gold/70"
            initial={reduced ? false : { scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
          />
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-12 lg:px-8">
        <Reveal>
          <section className="rounded-2xl border border-church-border bg-white p-5 shadow-card sm:p-6" aria-label={t('songs.filterLabel')}>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div>
                <label htmlFor="song-search" className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-church-blue">
                  {t('songs.searchLabel')}
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                  <input
                    id="song-search"
                    type="search"
                    value={search}
                    onChange={handleSearchChange}
                    placeholder={t('songs.searchPlaceholder')}
                    className="form-input h-12 rounded-xl pl-12 pr-11 text-sm focus:border-church-gold/60 focus:ring-2 focus:ring-church-gold/20"
                    aria-label={t('songs.searchLabel')}
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch('');
                        setDebouncedSearch('');
                        setPage(1);
                      }}
                      className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-gray-400 transition-colors hover:bg-church-light hover:text-church-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-church-gold"
                      aria-label={t('common.close')}
                    >
                      <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={clearFilters}
                disabled={!hasFilters}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-church-border bg-white px-4 text-xs font-semibold text-church-blue transition-colors hover:border-church-gold hover:bg-church-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-church-gold disabled:cursor-not-allowed disabled:opacity-40"
              >
                <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                {t('songs.clearFilters')}
              </button>
            </div>

            <div className="mt-5 border-t border-church-border pt-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-church-blue">{t('songs.categoryLabel')}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleCategoryChange(ALL_CATEGORIES)}
                  className={`filter-pill ${selectedCategory === ALL_CATEGORIES ? 'border-church-gold bg-church-gold text-church-blue shadow-card' : ''}`}
                  aria-pressed={selectedCategory === ALL_CATEGORIES}
                >
                  {t('songs.allCategories')}
                </button>
                {categories.map((category) => {
                  const active = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleCategoryChange(category)}
                      className={`filter-pill ${active ? 'border-church-gold bg-church-gold text-church-blue shadow-card' : ''}`}
                      aria-pressed={active}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.08} className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-church-blue">{resultLabel}</p>
            <p className="text-xs leading-relaxed text-gray-500 sm:text-sm">{t('songs.subtitle')}</p>
          </div>
        </Reveal>

        <div className="mt-6">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-24 rounded-2xl" />
              ))}
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="rounded-2xl border border-church-border bg-white shadow-card">
              <EmptyState title={t('songs.noSongs')} message={t('songs.noSongsHint')} />
            </div>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${page}-${debouncedSearch}-${selectedCategory}`}
                initial={reduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: EASE }}
              >
                <Stagger className="space-y-3" staggerDelay={0.045}>
                  {currentSongs.map((song) => (
                    <StaggerItem key={song.id}>
                      <article className="group flex min-h-[6.5rem] w-full items-center gap-3 rounded-2xl border border-church-border bg-white p-3.5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-church-gold/50 hover:shadow-card-hover motion-reduce:hover:translate-y-0 sm:gap-5 sm:p-5">
                        <div className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-church-blue text-white shadow-sm sm:h-20 sm:w-20">
                          <span className="absolute -right-3 -top-3 h-10 w-10 rounded-full bg-church-gold/20 blur-sm" aria-hidden="true" />
                          <div className="relative flex flex-col items-center">
                            <MusicalNoteIcon className="h-5 w-5 text-church-gold sm:h-6 sm:w-6" aria-hidden="true" />
                            <span className="mt-0.5 text-[11px] font-bold tabular-nums text-white/85 sm:text-xs">
                              {song.songNumber ?? '—'}
                            </span>
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="line-clamp-2 font-telugu text-base font-bold leading-snug text-church-blue sm:text-lg">
                              {song.titleTe}
                            </h3>
                            {song.category && song.category !== 'General' && (
                              <span className="badge bg-church-light text-church-blue text-[10px] sm:text-xs">
                                {song.category}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500 sm:text-sm">
                            {song.titleEn || song.titleTe}
                          </p>
                        </div>

                        <motion.div
                          className="shrink-0"
                          whileHover={reduced ? undefined : { scale: 1.06 }}
                          whileTap={reduced ? undefined : { scale: 0.94 }}
                          transition={{ duration: 0.2, ease: EASE }}
                        >
                          <Link
                            to={`/songs/${song.id}`}
                            className="grid h-11 w-11 place-items-center rounded-full bg-church-gold text-church-blue shadow-card-hover transition-colors hover:bg-church-gold/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-church-gold focus-visible:ring-offset-2 sm:h-12 sm:w-12"
                            aria-label={`${t('songs.openLyrics')}: ${song.titleTe || song.titleEn || ''}`}
                            title={t('songs.openLyrics')}
                          >
                            <PlayIcon className="ml-0.5 h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                          </Link>
                        </motion.div>
                      </article>
                    </StaggerItem>
                  ))}
                </Stagger>
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {!loading && filteredSongs.length > 0 && (
          <motion.nav
            className="mt-8 flex flex-col items-center gap-3"
            aria-label={t('songs.paginationLabel')}
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08, ease: EASE }}
          >
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="btn-secondary inline-flex h-10 items-center gap-1.5 rounded-xl px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
                aria-label={t('songs.previousPage')}
              >
                <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{t('common.prev')}</span>
              </button>

              {getPageNumbers(page, totalPages).map((item) => (
                item === 'start-ellipsis' || item === 'end-ellipsis' ? (
                  <span key={item} className="grid h-10 w-8 place-items-center text-sm text-gray-400" aria-hidden="true">…</span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => goToPage(item)}
                    className={`h-10 min-w-[2.5rem] rounded-xl px-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-church-gold sm:text-sm ${
                      item === page
                        ? 'bg-church-gold text-church-blue shadow-card'
                        : 'border border-church-border bg-white text-church-blue hover:border-church-gold hover:bg-church-cream'
                    }`}
                    aria-label={t('songs.pageNumber', { page: item })}
                    aria-current={item === page ? 'page' : undefined}
                  >
                    {item}
                  </button>
                )
              ))}

              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className="btn-secondary inline-flex h-10 items-center gap-1.5 rounded-xl px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
                aria-label={t('songs.nextPage')}
              >
                <span className="hidden sm:inline">{t('common.next')}</span>
                <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <p className="text-xs text-gray-500">
              {t('common.page')} {page} {t('common.of')} {totalPages}
            </p>
          </motion.nav>
        )}
      </main>
    </div>
  );
}
