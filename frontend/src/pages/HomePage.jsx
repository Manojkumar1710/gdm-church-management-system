/**
 * HomePage — Complete redesign
 *
 * Photography-led professional church homepage.
 * All API calls and data-fetching are UNCHANGED from the previous version.
 * Only presentation / layout / markup changes.
 *
 * Sections (in order):
 *   1. Hero             — full-width cross-at-sunset photo, left-aligned text
 *   2. Upcoming Events  — 2-col intro + card grid
 *   3. Latest Sermons   — label + cards
 *   4. About Church     — image + text
 *   5. Event Photos     — gallery preview row
 *   6. Our Pastors      — dark band with cards
 *   7. Prayer Banner    — full-width hands-on-Bible photo
 *   8. Contact strip    — compact navy band
 */

import { useEffect, useState } from 'react';
import { Link }               from 'react-router-dom';
import { churchService }      from '../services/churchService';
import { eventService }       from '../services/eventService';
import { sermonService }      from '../services/sermonService';
import { pastorService }      from '../services/pastorService';
import { CardSkeleton }       from '../components/Skeleton';
import Reveal                 from '../components/motion/Reveal';
import { StaggerItem }        from '../components/motion/Stagger';
import {
  CalendarIcon,
  MapPinIcon,
  PlayIcon,
  ArrowRightIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { getYoutubeId, getYoutubeThumbnail } from '../utils/youtube';
import { CHURCH_NAME }     from '../config/church';
import { useLanguage }     from '../context/LanguageContext';

/* ── Local photography assets ───────────────────────────────── */
import heroCrossImg  from '../assets/images/hero-cross.jpg';
import prayerBgImg   from '../assets/images/prayer-bg.jpg';
import heroBibleImg  from '../assets/images/hero-bible.jpg';
import doveImg       from '../assets/images/dove.png';

/* ─────────────────────────────────────────────────────────────
   SECTION LABEL  (small gold uppercase label above headings)
   ───────────────────────────────────────────────────────────── */
function Label({ children }) {
  return (
    <p className="text-church-gold text-xs font-bold uppercase tracking-[0.18em] mb-3">
      {children}
    </p>
  );
}

/* ─────────────────────────────────────────────────────────────
   1. HERO SECTION
   ───────────────────────────────────────────────────────────── */
function HeroSection({ hero }) {
  const { t } = useLanguage();
  const bgUrl = hero?.backgroundImageUrl || heroCrossImg;

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ minHeight: '88vh' }}
      aria-label="Welcome hero"
    >
      {/* Background photo — position right so cross stays visible */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center right',
          backgroundRepeat: 'no-repeat',
        }}
        aria-hidden="true"
      />

      {/* Left-to-right overlay — opaque left (text), transparent right (cross) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to right, rgba(8,16,36,0.88) 0%, rgba(8,16,36,0.72) 38%, rgba(8,16,36,0.28) 65%, rgba(8,16,36,0.05) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Content — constrained to ~42% width on desktop, full on mobile */}
      <div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center"
        style={{ minHeight: '88vh' }}
      >
        <div className="w-full lg:max-w-[44%] pt-28 pb-20">

          {/* Welcome pill */}
          <div className="inline-flex items-center gap-2 bg-church-gold/20 border border-church-gold/40
                          rounded-full px-4 py-1.5 mb-6">
            <img src={doveImg} alt="" aria-hidden="true" className="h-5 w-5 object-contain" />
            <span className="text-church-gold text-xs font-bold uppercase tracking-widest">
              {t('home.heroLabel')} {CHURCH_NAME}
            </span>
          </div>

          {/* Headline — clamped so it never overwhelms the photo */}
          <h1
            className="font-bold text-white leading-[1.10] mb-5 whitespace-pre-line"
            style={{
              fontFamily: 'Lora, Georgia, serif',
              fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
            }}
          >
            {hero?.title || t('home.heroTagline')}
          </h1>

          {/* Subheading */}
          <p
            className="text-white/70 leading-relaxed mb-8"
            style={{ fontSize: 'clamp(0.9rem, 1.4vw, 1.05rem)', maxWidth: '34ch' }}
          >
            {hero?.subtitle || `${CHURCH_NAME} — ${t('home.heroSubtitle')}`}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <Link
              to={hero?.primaryCtaUrl || '/about'}
              className="inline-flex items-center gap-2 bg-church-gold hover:bg-[#b89a3a]
                         text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-md
                         transition-colors duration-200"
            >
              {hero?.primaryCtaText || t('common.joinUs')}
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              to={hero?.secondaryCtaUrl || '/events'}
              className="inline-flex items-center gap-2 border border-white/45 hover:border-white
                         text-white font-semibold text-sm px-6 py-3 rounded-lg
                         transition-colors duration-200 hover:bg-white/10"
            >
              {hero?.secondaryCtaText || t('home.upcomingEvents')}
            </Link>
          </div>
        </div>
      </div>

      {/* Dove watermark — bottom-left, very subtle */}
      <div
        className="absolute bottom-16 left-6 hidden lg:block pointer-events-none select-none"
        aria-hidden="true"
        style={{ opacity: 0.18 }}
      >
        <img src={doveImg} alt="" className="w-28 object-contain" style={{ filter: 'brightness(10)' }} />
      </div>

      {/* Bottom fade removed — image runs naturally to the section edge */}
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   2. UPCOMING EVENTS
   ───────────────────────────────────────────────────────────── */
function EventCard({ event }) {
  const { dateLocale } = useLanguage();
  const dateStr = event.eventDate
    ? new Date(event.eventDate + 'T00:00:00').toLocaleDateString(dateLocale, {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : '';

  return (
    <Link
      to={`/events/${event.id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100
                 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
    >
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-navy-100">
            <CalendarIcon className="h-10 w-10 text-navy-300" />
          </div>
        )}
        {dateStr && (
          <span className="absolute top-3 left-3 bg-church-blue text-white text-xs
                           font-semibold px-2.5 py-1 rounded-full">
            {dateStr}
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2
                       group-hover:text-church-blue transition-colors duration-200 mb-2">
          {event.title}
        </h3>
        {event.location && (
          <p className="mt-auto text-xs text-gray-400 flex items-center gap-1">
            <MapPinIcon className="h-3 w-3 shrink-0 text-church-gold" />
            {event.location}
          </p>
        )}
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────
   3. SERMON CARD
   ───────────────────────────────────────────────────────────── */
function SermonCard({ sermon }) {
  const [imgErr, setImgErr] = useState(false);
  const thumb = sermon.thumbnailUrl || getYoutubeThumbnail(sermon.videoUrl);
  const ytId  = getYoutubeId(sermon.videoUrl);

  return (
    <Link
      to="/sermons"
      className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100
                 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
    >
      <div className="relative h-44 bg-church-blue overflow-hidden">
        {thumb && !imgErr ? (
          <img
            src={thumb}
            alt={sermon.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={heroBibleImg}
              alt=""
              className="w-full h-full object-cover opacity-60"
            />
          </div>
        )}
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-black/50 group-hover:bg-church-gold
                          flex items-center justify-center transition-colors duration-200 shadow">
            <PlayIcon className="h-5 w-5 text-white ml-0.5" />
          </div>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2
                       group-hover:text-church-blue transition-colors duration-200 mb-1.5">
          {sermon.title}
        </h3>
        <p className="text-xs text-gray-400 mt-auto">
          {[sermon.speaker, sermon.sermonDate].filter(Boolean).join(' · ')}
        </p>
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE COMPONENT
   ───────────────────────────────────────────────────────────── */
export default function HomePage() {
  const { t, dateLocale } = useLanguage();
  const [hero,       setHero]       = useState(null);
  const [churchInfo, setChurchInfo] = useState(null);
  const [events,     setEvents]     = useState([]);
  const [photos,     setPhotos]     = useState([]);
  const [sermons,    setSermons]    = useState([]);
  const [pastors,    setPastors]    = useState([]);
  const [loading,    setLoading]    = useState(true);

  /* ── All API calls unchanged ─────────────────────────────── */
  useEffect(() => {
    Promise.allSettled([
      churchService.getHero(),
      churchService.getInfo(),
      eventService.getUpcoming(),
      eventService.getLatestPhotos(12),
      sermonService.list(0, 3),
      pastorService.list(),
    ]).then(([heroR, infoR, evR, phR, serR, pasR]) => {
      if (heroR.status   === 'fulfilled') setHero(heroR.value.data.data);
      if (infoR.status   === 'fulfilled') setChurchInfo(infoR.value.data.data);
      if (evR.status     === 'fulfilled') setEvents(evR.value.data.data?.slice(0, 4)           || []);
      if (phR.status     === 'fulfilled') setPhotos(phR.value.data.data                         || []);
      if (serR.status    === 'fulfilled') setSermons(serR.value.data.data?.content?.slice(0, 3) || []);
      if (pasR.status    === 'fulfilled') setPastors(pasR.value.data.data?.slice(0, 3)          || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-church-cream">

      {/* ══════════════════════════════════════════════════════
          1. HERO
          ════════════════════════════════════════════════════ */}
      <HeroSection hero={hero} />

      {/* ══════════════════════════════════════════════════════
          2. UPCOMING EVENTS
          ════════════════════════════════════════════════════ */}
      <section className="py-20 bg-church-cream" aria-label="Upcoming events">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Two-column header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <Reveal>
                <Label>{t('home.upcomingEvents')}</Label>
                <h2 className="text-3xl md:text-4xl font-bold text-church-blue leading-tight"
                    style={{ fontFamily: 'Lora, Georgia, serif' }}>
                  {t('home.joinInWorship')}
                </h2>
                <p className="text-gray-500 mt-2 max-w-md text-sm">
                  {t('home.comeTogether')}
                </p>
              </Reveal>
            </div>
            <Reveal>
              <Link
                to="/events"
                className="shrink-0 inline-flex items-center gap-2 border border-church-blue
                           text-church-blue hover:bg-church-blue hover:text-white
                           text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors duration-200"
              >
                {t('common.viewAllEvents')} <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>

          {/* Cards */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1,2,3,4].map(i => <CardSkeleton key={i} />)}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <CalendarIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">{t('home.noEvents')}</p>
              <p className="text-sm mt-1">{t('home.checkBackSoon')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {events.map((e, i) => (
                <StaggerItem key={e.id}>
                  <EventCard event={e} />
                </StaggerItem>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          3. LATEST SERMONS
          ════════════════════════════════════════════════════ */}
      <section className="py-20 bg-church-light" aria-label="Latest sermons">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <Reveal>
                <Label>{t('home.latestSermons')}</Label>
                <h2 className="text-3xl md:text-4xl font-bold text-church-blue leading-tight"
                    style={{ fontFamily: 'Lora, Georgia, serif' }}>
                  {t('home.watchListen')}
                </h2>
                <p className="text-gray-500 mt-2 max-w-md text-sm">
                  {t('home.encouragedWord')}
                </p>
              </Reveal>
            </div>
            <Reveal>
              <Link
                to="/sermons"
                className="shrink-0 inline-flex items-center gap-2 border border-church-blue
                           text-church-blue hover:bg-church-blue hover:text-white
                           text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors duration-200"
              >
                {t('common.allSermons')} <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[1,2,3].map(i => <CardSkeleton key={i} />)}
            </div>
          ) : sermons.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <PlayIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">{t('sermons.noSermons')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {sermons.map((s, i) => (
                <StaggerItem key={s.id}>
                  <SermonCard sermon={s} />
                </StaggerItem>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          4. ABOUT GDM CHURCH  — image left, text right
          ════════════════════════════════════════════════════ */}
      <section className="py-20 bg-church-cream" aria-label="About GDM Church">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

              {/* Image */}
              <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-[4/3]">
                <img
                  src={heroBibleImg}
                  alt="Open Bible in a garden"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Gold accent bar */}
                <div className="absolute left-0 top-8 bottom-8 w-1 bg-church-gold rounded-r-full" />
              </div>

              {/* Text */}
              <div>
                <Label>{t('home.aboutChurch')}</Label>
                <h2 className="text-3xl md:text-4xl font-bold text-church-blue leading-tight mb-5"
                    style={{ fontFamily: 'Lora, Georgia, serif' }}>
                  {t('home.unitedFaith')}
                </h2>

                {/* Real description from API when available, fallback text */}
                <p className="text-gray-600 leading-relaxed mb-4">
                  {churchInfo?.description ||
                    `${CHURCH_NAME} is a vibrant, welcoming community of believers
                     dedicated to worship, fellowship and service in the heart of
                     Koyyalagudem, Andhra Pradesh.`}
                </p>

                {churchInfo?.mission && (
                  <div className="border-l-4 border-church-gold pl-4 mb-6">
                    <p className="text-sm font-semibold text-church-blue mb-1 uppercase tracking-wide">
                      {t('about.ourMission')}
                    </p>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {churchInfo.mission}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 mt-6">
                  <Link
                    to="/about"
                    className="inline-flex items-center gap-2 bg-church-blue hover:bg-navy-900
                               text-white text-sm font-semibold px-6 py-3 rounded-lg
                               transition-colors duration-200"
                  >
                    {t('common.learnMore')} <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 border border-church-blue
                               text-church-blue hover:bg-church-blue hover:text-white
                               text-sm font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
                  >
                    {t('common.getInTouch')}
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          5. EVENT PHOTOS GALLERY PREVIEW
          ════════════════════════════════════════════════════ */}
      {(loading || photos.length > 0) && (
        <section className="py-20 bg-church-light" aria-label="Event photos">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <Reveal>
                <Label>{t('nav.gallery')}</Label>
                <h2 className="text-3xl font-bold text-church-blue"
                    style={{ fontFamily: 'Lora, Georgia, serif' }}>
                  {t('home.lifeAtChurch')}
                </h2>
              </Reveal>
              <Reveal>
                <Link
                  to="/photos"
                  className="shrink-0 inline-flex items-center gap-2 border border-church-blue
                             text-church-blue hover:bg-church-blue hover:text-white
                             text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors duration-200"
                >
                  {t('common.seeAllPhotos')} <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </Reveal>
            </div>

            {loading ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-xl bg-gray-200 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {photos.slice(0, 12).map(p => (
                  <Link
                    key={p.id}
                    to="/photos"
                    className="aspect-square overflow-hidden rounded-xl bg-gray-100 group"
                  >
                    <img
                      src={p.imageUrl}
                      alt={p.title || 'Church photo'}
                      className="w-full h-full object-cover group-hover:scale-110
                                 transition-transform duration-500"
                      loading="lazy"
                    />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          6. OUR PASTORS — dark navy band
          ════════════════════════════════════════════════════ */}
      {pastors.length > 0 && (
        <section className="py-20 bg-church-blue" aria-label="Our pastors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <Reveal>
                <p className="text-church-gold text-xs font-bold uppercase tracking-[0.18em] mb-3">
                  {t('home.ourPastors')}
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight"
                    style={{ fontFamily: 'Lora, Georgia, serif' }}>
                  {t('home.meetShepherds')}
                </h2>
              </Reveal>
              <Reveal>
                <Link
                  to="/pastors"
                  className="shrink-0 inline-flex items-center gap-2 border border-white/30
                             text-white hover:bg-white/10 text-sm font-semibold px-5 py-2.5
                             rounded-lg transition-colors duration-200"
                >
                  {t('common.meetAllPastors')} <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </Reveal>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastors.map((p, i) => (
                <StaggerItem key={p.id}>
                  <div className="bg-white/8 border border-white/12 rounded-2xl p-6 text-center
                                  hover:bg-white/14 transition-colors duration-200">
                    {p.photoUrl ? (
                      <img
                        src={p.photoUrl}
                        alt={p.name}
                        className="w-24 h-24 rounded-full object-cover mx-auto mb-4
                                   ring-4 ring-church-gold/40 shadow-md"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-church-gold/20 border-2
                                      border-church-gold/40 flex items-center justify-center
                                      text-church-gold text-3xl font-bold mx-auto mb-4">
                        {p.name.charAt(0)}
                      </div>
                    )}
                    <p className="text-church-gold text-xs font-semibold uppercase tracking-widest mb-1">
                      {t('pastors.pastor')}
                    </p>
                    <h3 className="font-bold text-white text-base leading-snug"
                        style={{ fontFamily: 'Lora, Georgia, serif' }}>
                      {p.name}
                    </h3>
                    {p.village && (
                      <p className="text-white/50 text-sm mt-1 flex items-center justify-center gap-1">
                        <MapPinIcon className="h-3.5 w-3.5 text-church-gold/70 shrink-0" />
                        {p.village}
                      </p>
                    )}
                    {p.contactPublic && p.contactNumber && (
                      <a
                        href={`tel:${p.contactNumber}`}
                        className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full
                                   bg-church-gold/15 text-church-gold text-xs font-semibold
                                   hover:bg-church-gold/25 transition-colors duration-200"
                      >
                        <PhoneIcon className="h-3 w-3" />
                        {t('pastors.call')}
                      </a>
                    )}
                  </div>
                </StaggerItem>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          7. PRAYER BANNER — full-width photographic
          ════════════════════════════════════════════════════ */}
      <section
        className="relative py-24 overflow-hidden"
        aria-label="Prayer request"
      >
        {/* Background photo */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${prayerBgImg})` }}
          aria-hidden="true"
        />
        {/* Dark overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(10,20,40,0.72)' }}
          aria-hidden="true"
        />

        {/* Content */}
        <Reveal>
          <div className="relative z-10 max-w-3xl mx-auto px-4 text-center text-white">
            {/* Dove above heading */}
            <div className="flex justify-center mb-4">
              <img
                src={doveImg}
                alt=""
                aria-hidden="true"
                className="w-20 h-auto object-contain"
                style={{ filter: 'brightness(10) opacity(0.75)' }}
              />
            </div>
            <Label>{t('home.prayerRequests')}</Label>
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight"
              style={{ fontFamily: 'Lora, Georgia, serif' }}
            >
              {t('home.letUsPray')}
            </h2>
            <p className="text-white/75 text-lg mb-8 leading-relaxed max-w-xl mx-auto">
              {t('home.shareNeeds')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/prayer"
                className="inline-flex items-center justify-center gap-2
                           bg-church-gold hover:bg-[#b89a3a] text-white font-semibold
                           text-sm px-8 py-3.5 rounded-lg shadow-lg transition-colors duration-200"
              >
                {t('common.submitPrayer')}
              </Link>
              <Link
                to="/offerings"
                className="inline-flex items-center justify-center gap-2
                           border-2 border-white/40 hover:border-white
                           text-white font-semibold text-sm px-8 py-3.5 rounded-lg
                           transition-colors duration-200 hover:bg-white/10"
              >
                {t('common.giveOffering')}
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ══════════════════════════════════════════════════════
          8. CONTACT / FIND US — compact navy strip
          ════════════════════════════════════════════════════ */}
      <section className="py-14 bg-navy-950" aria-label="Find us">
        <Reveal>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">

              {/* Left — church identity */}
              <div>
                <p className="text-church-gold text-xs font-bold uppercase tracking-[0.18em] mb-2">
                  ✝ {CHURCH_NAME}
                </p>
                <p className="text-white/60 text-sm leading-relaxed max-w-xs">
                  {churchInfo?.address ||
                    'Chopparamma Gudem, Koyyalagudem, West Godavari — 534312'}
                </p>
              </div>

              {/* Centre — phone */}
              {churchInfo?.phone && (
                <a
                  href={`tel:${churchInfo.phone}`}
                  className="flex items-center gap-2 text-white/70 hover:text-white
                             transition-colors duration-200 text-sm"
                >
                  <PhoneIcon className="h-4 w-4 text-church-gold" />
                  {churchInfo.phone}
                </a>
              )}

              {/* Right — CTA */}
              <Link
                to="/contact"
                className="shrink-0 inline-flex items-center gap-2
                           bg-church-gold hover:bg-[#b89a3a] text-white font-semibold
                           text-sm px-6 py-3 rounded-lg transition-colors duration-200"
              >
                {t('common.getInTouch')} <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

    </div>
  );
}
