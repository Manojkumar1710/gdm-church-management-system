import { useEffect, useRef, useState, useCallback } from 'react';
import { eventService } from '../services/eventService';
import { galleryService } from '../services/galleryService';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import CrossDivider from '../components/ornaments/CrossDivider';
import { useLanguage } from '../context/LanguageContext';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { localized } from '../utils/localized';

/* ─── Lightbox ──────────────────────────────────────────────── */
function Lightbox({ photo, onClose, lang }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const title = typeof photo.title === 'string'
    ? photo.title
    : localized(photo, 'title', lang);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <button
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
        onClick={onClose}
        aria-label="Close"
      >
        <XMarkIcon className="h-7 w-7" />
      </button>
      <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
        <img
          src={photo.imageUrl}
          alt={title || 'Memory'}
          className="mx-auto max-h-[82vh] w-full rounded-2xl object-contain"
        />
        {title && (
          <p className="mt-3 text-center text-sm font-medium text-white/80">{title}</p>
        )}
      </div>
    </div>
  );
}

/* ─── Infinite auto-scroll carousel ────────────────────────── */
/*
 * Duplicates the photo list so the strip loops seamlessly.
 * Animation: CSS keyframe translates -50% (one full copy width) → reset to 0.
 * On hover / touch the animation pauses so users can browse.
 * Manual prev/next also pause auto-scroll for 4 s then resume.
 * prefers-reduced-motion: auto-scroll disabled; manual arrows only.
 */

const SCROLL_STYLES = `
@keyframes gdm-marquee {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.gdm-marquee-track {
  animation: gdm-marquee var(--marquee-duration, 40s) linear infinite;
  will-change: transform;
}
.gdm-marquee-wrap:hover .gdm-marquee-track,
.gdm-marquee-wrap.paused .gdm-marquee-track {
  animation-play-state: paused;
}
@media (prefers-reduced-motion: reduce) {
  .gdm-marquee-track { animation: none !important; }
}
`;

/* Card width in px for one item — used to position the scroll */
const CARD_W = 288; // px including gap
const GAP    = 16;  // px

function AutoScrollGallery({ photos, onOpen, reduced }) {
  const wrapRef  = useRef(null);
  const trackRef = useRef(null);
  const pauseTimer = useRef(null);
  const [paused, setPaused] = useState(false);

  /* Duplicate list for seamless loop */
  const doubled = [...photos, ...photos];

  /* Duration scales with number of photos so speed stays constant */
  const duration = Math.max(20, photos.length * 5);

  const pauseFor = useCallback((ms = 4000) => {
    setPaused(true);
    clearTimeout(pauseTimer.current);
    pauseTimer.current = setTimeout(() => setPaused(false), ms);
  }, []);

  /* Manual scroll: shift the CSS animation offset by moving current translateX */
  const scrollManual = useCallback((dir) => {
    const el = trackRef.current;
    if (!el) return;
    pauseFor(4000);
    /* Get current animated position and nudge by one card */
    const matrix = window.getComputedStyle(el).transform;
    let currentX = 0;
    if (matrix && matrix !== 'none') {
      currentX = parseFloat(matrix.split(',')[4]) || 0;
    }
    const newX = currentX + dir * -(CARD_W + GAP);
    el.style.transform = `translateX(${newX}px)`;
    el.style.transition = 'transform 0.4s cubic-bezier(0.22,1,0.36,1)';
    setTimeout(() => { if (el) el.style.transition = ''; }, 420);
  }, [pauseFor]);

  useEffect(() => () => clearTimeout(pauseTimer.current), []);

  if (reduced) {
    /* Reduced motion: plain grid, no animation */
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {photos.map((p, i) => (
          <button
            key={p.id ?? i}
            onClick={() => onOpen(p)}
            className="aspect-square overflow-hidden rounded-xl bg-gray-100 group"
            aria-label={p.title || 'View photo'}
          >
            <img
              src={p.imageUrl}
              alt={p.title || ''}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>
    );
  }

  return (
    <>
      <style>{SCROLL_STYLES}</style>

      {/* Navigation arrows */}
      <div className="mb-4 flex items-center justify-end gap-2">
        <button
          onClick={() => scrollManual(-1)}
          aria-label="Previous"
          className="grid h-9 w-9 place-items-center rounded-full border border-church-gold/30 bg-white shadow-sm transition-all hover:border-church-gold hover:bg-church-gold hover:text-white text-church-blue"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <button
          onClick={() => scrollManual(1)}
          aria-label="Next"
          className="grid h-9 w-9 place-items-center rounded-full border border-church-gold/30 bg-white shadow-sm transition-all hover:border-church-gold hover:bg-church-gold hover:text-white text-church-blue"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>

      {/* Overflow mask */}
      <div
        ref={wrapRef}
        className={`gdm-marquee-wrap overflow-hidden${paused ? ' paused' : ''}`}
        onMouseEnter={() => pauseFor(60000)}
        onMouseLeave={() => pauseFor(400)}
        onTouchStart={() => pauseFor(5000)}
      >
        {/* Scrolling strip */}
        <div
          ref={trackRef}
          className="gdm-marquee-track flex gap-4"
          style={{ '--marquee-duration': `${duration}s` }}
        >
          {doubled.map((p, i) => (
            <button
              key={`${p.id ?? 0}-${i}`}
              onClick={() => { pauseFor(8000); onOpen(p); }}
              className="group h-56 w-72 shrink-0 overflow-hidden rounded-2xl bg-gray-100 shadow-card"
              aria-label={p.title || 'View photo'}
              style={{ scrollSnapAlign: 'start' }}
            >
              <img
                src={p.imageUrl}
                alt={p.title || ''}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─── Page ─────────────────────────────────────────────────── */
export default function MemoriesPage() {
  const { t, lang } = useLanguage();
  const reduced = useReducedMotion();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    Promise.allSettled([
      eventService.getLatestPhotos(60),
      galleryService.list(0, 60),
    ]).then(([epRes, galRes]) => {
      const eventPhotos = epRes.status === 'fulfilled'
        ? (epRes.value.data.data || [])
        : [];
      const galleryItems = galRes.status === 'fulfilled'
        ? (galRes.value.data.data?.content || [])
        : [];

      /* Merge, deduplicate by imageUrl, shuffle lightly */
      const seen = new Set();
      const merged = [...eventPhotos, ...galleryItems].filter(p => {
        if (!p.imageUrl || seen.has(p.imageUrl)) return false;
        seen.add(p.imageUrl);
        return true;
      });
      setPhotos(merged);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-church-cream">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-church-gold">
            CHURCH MEMORIES
          </p>
          <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-church-blue sm:text-4xl">
            Moments That Bring Us Together
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-500">
            Memories of worship, fellowship and life within our church community.
          </p>
          <CrossDivider className="mt-6" opacity={0.3} />
        </div>

        {/* Gallery */}
        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-56 w-72 shrink-0 animate-pulse rounded-2xl bg-gray-200" />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="mx-auto max-w-md rounded-3xl border border-church-gold/20 bg-white px-8 py-16 text-center shadow-card">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-church-gold/10 text-church-gold">
              <PhotoIcon className="h-7 w-7" />
            </div>
            <h2 className="font-serif text-xl font-bold text-church-blue">No memories yet</h2>
            <p className="mt-2 text-sm text-gray-500">
              Photos will appear here as your church community grows.
            </p>
          </div>
        ) : (
          <AutoScrollGallery
            photos={photos}
            onOpen={setLightbox}
            reduced={reduced}
          />
        )}
      </div>

      {lightbox && (
        <Lightbox photo={lightbox} onClose={() => setLightbox(null)} lang={lang} />
      )}
    </div>
  );
}
