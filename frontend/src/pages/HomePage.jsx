import { Children, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { churchService } from '../services/churchService';
import { eventService } from '../services/eventService';
import { sermonService } from '../services/sermonService';
import { pastorService } from '../services/pastorService';
import { CardSkeleton } from '../components/Skeleton';
import {
  CalendarIcon,
  MapPinIcon,
  PlayIcon,
  ArrowRightIcon,
  PhoneIcon,
  ClockIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import { getYoutubeId, getYoutubeThumbnail } from '../utils/youtube';
import { CHURCH_NAME } from '../config/church';
import { useLanguage } from '../context/LanguageContext';
import AnimatedText, { useInViewOnce } from '../components/motion/AnimatedText';

import heroCrossImg from '../assets/images/hero-cross.jpg';
import prayerBgImg from '../assets/images/prayer-bg.jpg';
import heroBibleImg from '../assets/images/hero-bible.jpg';
import doveImg from '../assets/images/dove.png';
import churchImg from '../assets/images/church.jpg';

const HOME_STYLES = `
.home-redesign {
  --home-ease: cubic-bezier(0.22, 1, 0.36, 1);
}
.home-redesign .home-hero-photo {
  animation: homeHeroZoom 12s var(--home-ease) 0s infinite alternate;
  transform-origin: 70% center;
  will-change: transform;
}
@keyframes homeHeroZoom {
  from { transform: scale(1.02); }
  to { transform: scale(1.07); }
}
.home-redesign .home-hero-warm-light {
  background:
    radial-gradient(circle at 82% 28%, rgba(255, 232, 176, 0.12), transparent 34%),
    radial-gradient(circle at 62% 74%, rgba(201, 168, 76, 0.08), transparent 30%),
    radial-gradient(circle at 18% 22%, rgba(255, 255, 255, 0.04), transparent 26%);
  animation: homeHeroGlowPulse 4s var(--home-ease) 0s infinite alternate;
}
.home-redesign .home-hero-warm-light::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 74% 30%, rgba(255, 240, 198, 0.08), transparent 18%),
    radial-gradient(circle at 88% 66%, rgba(201, 168, 76, 0.06), transparent 16%);
  animation: homeHeroFloat 9s var(--home-ease) infinite alternate;
}
@keyframes homeHeroGlowPulse {
  from { opacity: 0.66; }
  to { opacity: 1; }
}
@keyframes homeHeroFloat {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(-10px, 8px, 0); }
}
.home-redesign .home-hero-badge {
  animation: homeFadeIn 0.7s 0.05s var(--home-ease) both;
}
.home-redesign .home-hero-title {
  animation: homeRiseIn 0.9s 0.2s var(--home-ease) both;
  text-shadow: 0 0 30px rgba(201, 168, 76, 0.26);
}
.home-redesign .home-hero-title-line {
  display: block;
  white-space: normal;
  overflow-wrap: break-word;
  word-break: break-word;
}
.home-redesign .home-hero-description {
  animation: homeRiseIn 0.8s 0.7s var(--home-ease) both;
  text-shadow: 0 0 22px rgba(255, 255, 255, 0.12);
}
.home-redesign .home-hero-actions {
  animation: homeRiseIn 0.7s 1s var(--home-ease) both;
}
.home-redesign .home-letter-reveal {
  display: block;
}
.home-redesign .home-letter-reveal--inline {
  display: inline;
}
.home-redesign .home-letter {
  display: inline-block;
  opacity: 0;
  transform: translateY(12px);
  white-space: pre;
  will-change: opacity, transform;
}
.home-redesign .home-letter-reveal.is-visible .home-letter {
  animation: homeLetterReveal 450ms var(--home-ease) both;
}
@keyframes homeLetterReveal {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.home-redesign .home-hero-badge-dove,
.home-redesign .home-hero-dove img,
.home-redesign .home-prayer-dove img {
  animation: homeDoveFloat 3.5s ease-in-out infinite, homeDoveGlow 2.8s ease-in-out infinite;
  will-change: transform, filter;
}
.home-redesign .home-hero-dove {
  opacity: 0.92;
  z-index: 1;
}
.home-redesign .home-hero-dove::before {
  content: '';
  position: absolute;
  inset: -30%;
  border-radius: 9999px;
  background: radial-gradient(circle, rgba(201, 168, 76, 0.20), transparent 70%);
}
.home-redesign .home-prayer-dove {
  box-shadow: 0 0 30px rgba(201, 168, 76, 0.18);
  animation: homeMedallionGlow 2.8s ease-in-out infinite;
}
@keyframes homeDoveFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
@keyframes homeDoveGlow {
  0%, 100% {
    filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.42))
            drop-shadow(0 0 14px rgba(201, 168, 76, 0.18));
  }
  50% {
    filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.62))
            drop-shadow(0 0 24px rgba(201, 168, 76, 0.28));
  }
}
@keyframes homeMedallionGlow {
  0%, 100% { box-shadow: 0 0 24px rgba(201, 168, 76, 0.14); }
  50% { box-shadow: 0 0 38px rgba(201, 168, 76, 0.26); }
}
.home-redesign .home-hero-cta,
.home-redesign .btn-outline-navy,
.home-redesign .btn-outline-light,
.home-redesign .home-play-button,
.home-redesign .home-pastor-card a {
  transition-duration: 0.25s;
}
.home-redesign .home-hero-cta {
  transition-property: transform, box-shadow, background-color, color, border-color;
}
.home-redesign .home-hero-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 0 1px rgba(201, 168, 76, 0.45), 0 14px 34px rgba(201, 168, 76, 0.22);
}
.home-redesign .home-hero-cta--outline:hover {
  box-shadow: 0 0 0 1px rgba(201, 168, 76, 0.55), 0 12px 30px rgba(201, 168, 76, 0.16);
}
.home-redesign .home-card-hover {
  transition-property: transform, box-shadow, border-color, background-color;
  transition-duration: 0.3s;
  transition-timing-function: var(--home-ease);
}
.home-redesign .home-media-hover img,
.home-redesign .home-pastor-photo {
  transition: transform 0.5s var(--home-ease);
}
.home-redesign .home-media-hover:hover img,
.home-redesign .home-pastor-card:hover .home-pastor-photo {
  transform: scale(1.06);
}
.home-redesign .home-anim {
  opacity: 0;
  transform: translateY(18px);
}
.home-redesign .home-anim.is-in {
  animation: homeRiseIn var(--home-duration, 0.75s) var(--home-ease) var(--home-delay, 0s) both;
}
.home-redesign .home-welcome-media.home-anim {
  transform: none;
}
.home-redesign .home-welcome-media.home-anim.is-in {
  animation: homeFadeIn 0.9s var(--home-ease) both, homeMediaZoom 1.2s var(--home-ease) both;
}
.home-redesign .home-stagger-item {
  opacity: 0;
  transform: translateY(20px);
}
.home-redesign .home-stagger.is-in > .home-stagger-item {
  animation: homeStaggerIn var(--home-duration, 0.75s) var(--home-ease)
             calc(var(--stagger-index) * var(--stagger-step, 0.15s)) both;
}
.home-redesign .home-gallery .home-stagger-item {
  opacity: 0;
  transform: translateY(18px) scale(0.97);
}
.home-redesign .home-gallery.is-in > .home-stagger-item {
  animation: homeGalleryIn var(--home-duration, 0.7s) var(--home-ease)
             calc(var(--stagger-index) * var(--stagger-step, 0.12s)) both;
}
.home-redesign .home-card-info {
  opacity: 0;
}
.home-redesign .home-anim.is-in .home-card-info,
.home-redesign .home-stagger.is-in .home-card-info {
  animation: homeFadeIn 0.5s var(--home-ease) 0.12s both;
}
@keyframes homeFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes homeRiseIn {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes homeMediaZoom {
  from { transform: scale(1.03); }
  to { transform: scale(1); }
}
@keyframes homeStaggerIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes homeGalleryIn {
  from { opacity: 0; transform: translateY(18px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
body.home-page-active footer .grid > div { min-width: 0; }
body.home-page-active footer .section-label { line-height: 1.7; }
html[lang="te"] body.home-page-active footer { line-height: 1.85; }
html[lang="te"] body.home-page-active footer p,
html[lang="te"] body.home-page-active footer li,
html[lang="te"] body.home-page-active footer a { line-height: 1.85; overflow-wrap: break-word; }
html[lang="te"] body.home-page-active footer .section-label { letter-spacing: 0.04em; line-height: 1.9; }
html[lang="te"] body.home-page-active footer .flex.items-start { align-items: flex-start; }
html[lang="te"] body.home-page-active footer svg { margin-top: 0.2rem; }
html[lang="te"] body.home-page-active footer .break-all { overflow-wrap: anywhere; }
@media (prefers-reduced-motion: reduce) {
  .home-redesign .home-hero-photo,
  .home-redesign .home-hero-warm-light,
  .home-redesign .home-hero-warm-light::after,
  .home-redesign .home-hero-badge,
  .home-redesign .home-hero-title,
  .home-redesign .home-hero-description,
  .home-redesign .home-hero-actions,
  .home-redesign .home-hero-badge-dove,
  .home-redesign .home-hero-dove img,
  .home-redesign .home-prayer-dove,
  .home-redesign .home-prayer-dove img,
  .home-redesign .home-letter,
  .home-redesign .home-anim,
  .home-redesign .home-stagger-item,
  .home-redesign .home-card-info {
    animation: none !important;
    transition: none !important;
  }
  .home-redesign .home-letter,
  .home-redesign .home-anim,
  .home-redesign .home-stagger-item,
  .home-redesign .home-card-info {
    opacity: 1 !important;
    transform: none !important;
  }
  .home-redesign .home-hero-cta:hover,
  .home-redesign .home-media-hover:hover img,
  .home-redesign .home-pastor-card:hover .home-pastor-photo {
    transform: none !important;
  }
}
`;

function formatEventTime(value, locale) {
  if (!value) return '';
  const match = String(value).match(/^(\d{1,2}):(\d{2})/);
  if (!match) return String(value);
  const time = new Date();
  time.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return time.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });
}

function formatSermonDate(value, locale) {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(locale, {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function fallbackImage(event) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = heroBibleImg;
}

function localized(item, field, lang) {
  if (!item) return '';
  const translations = item.translations || {};
  const en = item[`${field}En`] ?? item[`${field}_en`] ?? translations.en?.[field] ?? translations[field]?.en;
  const te = item[`${field}Te`] ?? item[`${field}_te`] ?? translations.te?.[field] ?? translations[field]?.te;
  return (lang === 'te' ? te || en : en || item[field]) || item[field] || '';
}

function HomeAnim({ as: Tag = 'div', className = '', delay = 0, duration = 0.75, style, children, ...rest }) {
  const [ref, inView] = useInViewOnce(0.12);

  return (
    <Tag
      ref={ref}
      className={`home-anim ${inView ? 'is-in' : ''} ${className}`}
      style={{
        ...style,
        '--home-delay': `${delay}s`,
        '--home-duration': `${duration}s`,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

function HomeStagger({ children, className = '', step = 0.15, duration = 0.75 }) {
  const [ref, inView] = useInViewOnce(0.12);

  return (
    <div
      ref={ref}
      className={`home-stagger ${inView ? 'is-in' : ''} ${className}`}
      style={{ '--stagger-step': `${step}s`, '--home-duration': `${duration}s` }}
    >
      {Children.map(children, (child, index) => (
        <div
          className={`home-stagger-item ${child?.props?.className || ''}`}
          key={child?.key ?? index}
          style={{ ...child?.props?.style, '--stagger-index': index }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

function Label({ children, className = '' }) {
  return <p className={`section-label ${className}`}>{children}</p>;
}

function GoldRule({ light = false }) {
  return (
    <div className="mt-5 flex items-center gap-3" aria-hidden="true">
      <span className={`h-px w-12 ${light ? 'bg-church-gold/70' : 'bg-church-gold'}`} />
      <span className="text-sm leading-none text-church-gold">+</span>
      <span className={`h-px w-6 ${light ? 'bg-church-gold/40' : 'bg-church-gold/50'}`} />
    </div>
  );
}

function SectionHeading({ label, lang, title, description, action, light = false, labelClassName = '', titleClassName = '' }) {
  return (
    <HomeAnim className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <Label className={labelClassName}>
          <AnimatedText text={label} lang={lang} inline stagger={lang === 'te' ? 0.065 : 0.055} />
        </Label>
        <h2 className={`mt-3 font-serif text-3xl font-bold leading-tight sm:text-4xl ${light ? 'text-white' : 'text-church-blue'} ${titleClassName}`}>
          {title}
        </h2>
        <GoldRule light={light} />
        {description && (
          <p className={`mt-4 max-w-xl text-sm leading-7 sm:text-base ${light ? 'text-white/70' : 'text-gray-600'}`}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </HomeAnim>
  );
}

function HeroSection({ hero }) {
  const { t, lang } = useLanguage();
  const bgUrl = hero?.backgroundImageUrl || heroCrossImg;
  const isTelugu = lang === 'te';
  const rawLines = (hero?.title || t('home.heroTagline')).split('\n');
  const lines = lang === 'te' ? rawLines : rawLines.map(line => line.replace(/\.$/, '').toUpperCase());

  return (
    <section
      className="hero-section relative w-full overflow-hidden"
      style={{ backgroundColor: '#0d1e31' }}
      aria-label="Welcome hero"
    >
      <div
        className="hero-photo home-hero-photo absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
        aria-hidden="true"
      />

      <div className="absolute inset-0 z-0 bg-[#081024]/60 lg:hidden" aria-hidden="true" />
      <div
        className="absolute inset-0 z-0 hidden lg:block"
        style={{
          background:
            'linear-gradient(to right, rgba(8,16,36,0.90) 0%, rgba(8,16,36,0.76) 36%, rgba(8,16,36,0.32) 68%, rgba(8,16,36,0.06) 100%)',
        }}
        aria-hidden="true"
      />
      <div className="home-hero-warm-light pointer-events-none absolute inset-0 z-0" aria-hidden="true" />

      <div className="page-container hero-section__inner relative z-10 flex items-center pb-14 pt-24 sm:pb-20 sm:pt-28">
        <div className="w-full max-w-2xl lg:max-w-[52%]">
          <div className="home-hero-badge mb-6 inline-flex items-center gap-2 rounded-full border border-church-gold/40 bg-church-gold/20 px-4 py-1.5">
            <img src={doveImg} alt="" aria-hidden="true" className="home-hero-badge-dove h-5 w-5 object-contain" />
            <span className="text-xs font-bold uppercase tracking-widest text-church-gold">
              {t('home.heroLabel')} {CHURCH_NAME}
            </span>
          </div>

          <h1
            className="home-hero-title mb-5 max-w-none font-serif font-bold tracking-tight text-white"
            style={{
              fontSize: isTelugu ? 'clamp(1.25rem, 3.2vw, 2.48rem)' : 'clamp(1.35rem, 4.35vw, 3.42rem)',
              lineHeight: isTelugu ? 1.35 : 1.18,
              letterSpacing: isTelugu ? '0' : undefined,
            }}
            aria-label={lines.join(' ')}
          >
            {lines.map((line, index) => (
              <span key={`${line}-${index}`} className="home-hero-title-line">
                <AnimatedText text={line} lang={lang} baseDelay={0.2 + index * 0.16} stagger={lang === 'te' ? 0.065 : 0.055} />
              </span>
            ))}
          </h1>

          <p className="home-hero-description mb-8 max-w-[38ch] text-base leading-relaxed text-white/80 sm:text-lg">
            {hero?.subtitle || `${CHURCH_NAME} — ${t('home.heroSubtitle')}`}
          </p>

          <div className="home-hero-actions flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              to={hero?.primaryCtaUrl || '/events'}
              className="btn-gold home-hero-cta h-11 px-6"
            >
              {hero?.primaryCtaText || t('home.upcomingEvents')}
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              to={hero?.secondaryCtaUrl || '/sermons'}
              className="btn-outline-light home-hero-cta home-hero-cta--outline px-6"
            >
              {hero?.secondaryCtaText || t('home.watchSermons')}
              <PlayIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div
        className="home-hero-dove pointer-events-none absolute left-4 top-4 z-0 w-14 select-none sm:left-[4%] sm:top-6 sm:w-20 lg:left-[5%] lg:top-8 lg:w-28"
        aria-hidden="true"
      >
        <img src={doveImg} alt="" className="w-full object-contain" />
      </div>
    </section>
  );
}

function WelcomeSection({ churchInfo, t, lang }) {
  return (
    <section className="section-pad bg-church-cream" aria-label="Welcome to our church">
      <div className="page-container grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-20">
        <HomeAnim className="home-welcome-media relative">
          <div className="home-media-hover relative overflow-hidden rounded-[2rem] bg-white shadow-card">
            <div className="aspect-[4/3] sm:aspect-[5/4]">
              <img src={churchImg} alt={CHURCH_NAME} className="h-full w-full object-cover" loading="lazy" onError={fallbackImage} />
            </div>
          </div>
          <div className="absolute -bottom-5 -right-3 hidden w-44 rounded-2xl border border-church-gold/30 bg-white p-5 shadow-card sm:block" aria-hidden="true">
            <span className="block font-serif text-3xl text-church-gold">+</span>
            <span className="mt-2 block text-xs font-semibold uppercase tracking-[0.18em] text-church-blue">Grace · Faith · Love</span>
          </div>
        </HomeAnim>

        <div>
          <HomeAnim>
            <Label>
              <AnimatedText text={t('home.welcomeLabel')} lang={lang} inline stagger={lang === 'te' ? 0.065 : 0.055} />
            </Label>
            <h2 className="mt-3 font-serif text-2xl font-bold leading-tight text-church-blue sm:text-3xl lg:text-[2.25rem]">
              {t('home.welcomeTitle')}
            </h2>
            <GoldRule />
          </HomeAnim>

          <HomeAnim as="p" delay={0.35} duration={0.7} className="mt-5 text-base leading-8 text-gray-600">
            {t('home.welcomeIntro')}
          </HomeAnim>
          <HomeAnim as="p" delay={0.5} duration={0.7} className="mt-4 text-sm leading-7 text-gray-500">
            {t('home.welcomeDescription')}
          </HomeAnim>

          {(churchInfo?.mission || churchInfo?.vision) && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {churchInfo?.vision && (
                <div className="rounded-r-xl border-l-4 border-church-gold bg-white/80 p-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-church-gold">{t('about.ourVision')}</p>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{churchInfo.vision}</p>
                </div>
              )}
              {churchInfo?.mission && (
                <div className="rounded-r-xl border-l-4 border-church-gold bg-white/80 p-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-church-gold">{t('about.ourMission')}</p>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{churchInfo.mission}</p>
                </div>
              )}
            </div>
          )}

          <HomeAnim delay={0.7} duration={0.65}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/about" className="btn-primary h-11 px-6">
                {t('common.learnMore')}
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link to="/contact" className="btn-outline-navy px-6">
                {t('common.getInTouch')}
              </Link>
            </div>
          </HomeAnim>
        </div>
      </div>
    </section>
  );
}

function EmptyPanel({ icon: Icon, title, message, action }) {
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-church-gold/20 bg-white px-6 py-14 text-center shadow-card">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-church-gold/10 text-church-gold">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </div>
      <h3 className="mt-5 font-serif text-xl font-bold text-church-blue">{title}</h3>
      {message && <p className="mt-2 text-sm leading-7 text-gray-600">{message}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

function EventDateBadge({ event }) {
  const { dateLocale } = useLanguage();
  if (!event.eventDate) return null;

  const date = new Date(`${event.eventDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;

  return (
    <span className="inline-flex items-center gap-2 rounded-2xl border border-church-gold/40 bg-white/95 px-3 py-2 shadow-sm backdrop-blur-sm">
      <span className="text-lg font-bold leading-none text-church-blue">{date.getDate()}</span>
      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-church-gold">
        {date.toLocaleDateString(dateLocale, { month: 'short' })}
      </span>
    </span>
  );
}

function EventVisual({ event, aspect }) {
  const { dateLocale } = useLanguage();
  const startTime = formatEventTime(event.startTime, dateLocale);
  const endTime = formatEventTime(event.endTime, dateLocale);
  const timeStr = startTime ? (endTime ? `${startTime} – ${endTime}` : startTime) : '';

  return (
    <div className={`home-media-hover relative overflow-hidden bg-church-blue ${aspect}`}>
      {event.imageUrl ? (
        <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover" loading="lazy" onError={fallbackImage} />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-navy-100">
          <CalendarIcon className="h-10 w-10 text-navy-300" aria-hidden="true" />
        </div>
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-navy-950/55 via-transparent to-transparent" aria-hidden="true" />
      <span className="absolute left-4 top-4"><EventDateBadge event={event} /></span>
      {timeStr && (
        <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-church-blue shadow-sm">
          <ClockIcon className="h-3.5 w-3.5 text-church-gold" aria-hidden="true" />
          {timeStr}
        </span>
      )}
    </div>
  );
}

function UniformEventCard({ event, t, lang }) {
  const title = localized(event, 'title', lang);
  const description = localized(event, 'description', lang);
  const location = localized(event, 'location', lang);

  return (
    <Link
      to={`/events/${event.id}`}
      className="home-card-hover group flex h-full flex-col overflow-hidden rounded-3xl border border-church-gold/20 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover motion-reduce:hover:translate-y-0"
    >
      <EventVisual event={{ ...event, title }} aspect="aspect-[16/9]" />
      <div className="home-card-info flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="line-clamp-2 font-serif text-lg font-bold leading-snug text-church-blue transition-colors duration-200 group-hover:text-church-gold">
          {title}
        </h3>
        {description && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">{description}</p>
        )}
        {location && (
          <p className="mt-auto flex items-center gap-1.5 pt-4 text-xs text-gray-500">
            <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-church-gold" aria-hidden="true" />
            <span className="truncate">{location}</span>
          </p>
        )}
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-church-blue">
          {t('home.viewDetails')}
          <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
        </span>
      </div>
    </Link>
  );
}

function FeaturedEventCard({ event, t, lang }) {
  return <UniformEventCard event={event} t={t} lang={lang} />;
}

function CompactEventCard({ event, lang }) {
  const { t } = useLanguage();
  return <UniformEventCard event={event} t={t} lang={lang} />;
}

function EventsSection({ events, loading, t }) {
  const { lang } = useLanguage();

  return (
    <section className="section-pad bg-church-cream" aria-label="Upcoming events">
      <div className="page-container">
        <SectionHeading
          label={t('home.upcomingEvents')}
          lang={lang}
          labelClassName={lang === 'te' ? 'text-base sm:text-lg tracking-[0.14em]' : ''}
          title={t('home.eventsTitle')}
          description={t('home.eventsDescription')}
          action={
            <Link to="/events" className="btn-outline-navy px-6">
              {t('common.viewAllEvents')}
            </Link>
          }
        />

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : events.length === 0 ? (
          <EmptyPanel icon={CalendarIcon} title={t('home.noEvents')} message={t('home.checkBackSoon')} />
        ) : (
          <HomeStagger className={`grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`}>
            {events.slice(0, 3).map(event => (
              <div key={event.id} className="h-full">
                <UniformEventCard event={event} t={t} lang={lang} />
              </div>
            ))}
          </HomeStagger>
        )}
      </div>
    </section>
  );
}

function SermonVisual({ sermon, aspect, lang }) {
  const [imgErr, setImgErr] = useState(false);
  const title = localized(sermon, 'title', lang);
  const thumb = sermon.thumbnailUrl || getYoutubeThumbnail(sermon.videoUrl);
  const hasVideo = Boolean(getYoutubeId(sermon.videoUrl));

  return (
    <div className={`home-media-hover relative overflow-hidden bg-church-blue ${aspect}`}>
      {thumb && !imgErr ? (
        <img
          src={thumb}
          alt={title}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setImgErr(true)}
        />
      ) : (
        <img src={heroBibleImg} alt="" className="h-full w-full object-cover opacity-60" />
      )}
      <span className="absolute inset-0 flex items-center justify-center bg-church-blue/10" aria-hidden="true">
        <span className="grid h-12 w-12 place-items-center rounded-full border border-white/60 bg-church-blue/80 text-white shadow-lg transition-colors duration-200 group-hover:border-church-gold group-hover:bg-church-gold group-hover:text-church-blue">
          <PlayIcon className="ml-0.5 h-5 w-5" />
        </span>
      </span>
      {hasVideo && <span className="sr-only">Video available</span>}
    </div>
  );
}

function UniformSermonCard({ sermon, t, lang, dateLocale }) {
  const title = localized(sermon, 'title', lang);
  const description = localized(sermon, 'description', lang);
  const speaker = localized(sermon, 'speaker', lang);
  const dateStr = formatSermonDate(sermon.sermonDate, dateLocale);

  return (
    <Link
      to={`/sermons/${sermon.id}`}
      className="home-card-hover group flex h-full flex-col overflow-hidden rounded-3xl border border-church-gold/20 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover motion-reduce:hover:translate-y-0"
    >
      <SermonVisual sermon={sermon} aspect="aspect-video" lang={lang} />
      <div className="home-card-info flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="line-clamp-2 font-serif text-lg font-bold leading-snug text-church-blue transition-colors duration-200 group-hover:text-church-gold">
          {title}
        </h3>
        <p className="mt-2 text-xs text-gray-500">
          {[speaker, dateStr].filter(Boolean).join(' · ')}
        </p>
        {description && (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600">{description}</p>
        )}
        <span className="mt-auto pt-4 inline-flex items-center gap-2 text-sm font-semibold text-church-blue">
          {t('home.watchMessage')}
          <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
        </span>
      </div>
    </Link>
  );
}

/* kept as thin wrappers so nothing else in the file breaks */
function FeaturedSermonCard({ sermon, t, lang, dateLocale }) {
  return <UniformSermonCard sermon={sermon} t={t} lang={lang} dateLocale={dateLocale} />;
}

function CompactSermonCard({ sermon, lang, dateLocale }) {
  const { t } = useLanguage();
  return <UniformSermonCard sermon={sermon} t={t} lang={lang} dateLocale={dateLocale} />;
}

function SermonsSection({ sermons, loading, t, dateLocale }) {
  const { lang } = useLanguage();

  return (
    <section className="section-pad bg-white" aria-label="Latest sermons">
      <div className="page-container">
        <SectionHeading
          label={t('home.latestSermons')}
          lang={lang}
          title={t('home.sermonsTitle')}
          description={t('home.sermonsDescription')}
          action={
            <Link to="/sermons" className="btn-outline-navy px-6">
              {t('common.allSermons')}
            </Link>
          }
        />

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : sermons.length === 0 ? (
          <EmptyPanel icon={PlayIcon} title={t('sermons.noSermons')} message={t('home.sermonsDescription')} />
        ) : (
          <HomeStagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sermons.slice(0, 3).map(sermon => (
              <div key={sermon.id} className="h-full">
                <UniformSermonCard sermon={sermon} t={t} lang={lang} dateLocale={dateLocale} />
              </div>
            ))}
          </HomeStagger>
        )}
      </div>
    </section>
  );
}

function PastorPreviewCard({ pastor, t, lang }) {
  const [imgErr, setImgErr] = useState(false);
  const bio = localized(pastor, 'bio', lang);

  return (
    <div className="home-pastor-card flex h-full flex-col items-center rounded-3xl border border-white/10 bg-white/[0.06] p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:border-church-gold/40 hover:bg-white/[0.10] motion-reduce:hover:translate-y-0">
      <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-full border-2 border-church-gold/60 bg-church-gold/15 shadow-avatar">
        {pastor.photoUrl && !imgErr ? (
          <img
            src={pastor.photoUrl}
            alt={pastor.name}
            className="home-pastor-photo h-full w-full object-cover"
            loading="lazy"
            onError={() => setImgErr(true)}
          />
        ) : (
          <span className="font-serif text-3xl font-bold text-church-gold">{pastor.name?.charAt(0)}</span>
        )}
      </div>
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-church-gold">{t('pastors.pastor')}</p>
      <h3 className="mt-2 font-serif text-xl font-bold text-white">{pastor.name}</h3>
      {pastor.village && (
        <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-white/60">
          <MapPinIcon className="h-3.5 w-3.5 text-church-gold/80" aria-hidden="true" />
          {pastor.village}
        </p>
      )}
      {bio && <p className="mt-4 line-clamp-2 text-sm leading-6 text-white/65">{bio}</p>}
      {pastor.contactPublic && pastor.contactNumber && (
        <a
          href={`tel:${pastor.contactNumber}`}
          className="mt-auto inline-flex items-center gap-2 rounded-full bg-church-gold/15 px-4 py-2 text-xs font-semibold text-church-gold transition-colors duration-200 hover:bg-church-gold/25"
        >
          <PhoneIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {t('pastors.call')}
        </a>
      )}
    </div>
  );
}

function PastorsSection({ pastors, t }) {
  const { lang } = useLanguage();

  return (
    <section className="section-pad bg-church-blue" aria-label="Our pastors">
      <div className="page-container">
        <SectionHeading
          light
          label={t('home.ourPastors')}
          lang={lang}
          title={t('home.pastorsTitle')}
          description={t('home.pastorsDescription')}
          action={
            <Link to="/pastors" className="btn-outline-light px-6">
              {t('common.meetAllPastors')}
            </Link>
          }
        />

        {pastors.length > 0 ? (
          <HomeStagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pastors.map(pastor => (
              <div key={pastor.id} className="h-full">
                <PastorPreviewCard pastor={pastor} t={t} lang={lang} />
              </div>
            ))}
          </HomeStagger>
        ) : (
          <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/[0.06] px-6 py-12 text-center">
            <span className="font-serif text-4xl text-church-gold" aria-hidden="true">+</span>
            <h3 className="mt-4 font-serif text-xl font-bold text-white">{t('home.meetShepherds')}</h3>
            <p className="mt-2 text-sm leading-7 text-white/65">{t('home.pastorsDescription')}</p>
          </div>
        )}
      </div>
    </section>
  );
}

function GallerySection({ photos, loading, t }) {
  const { lang } = useLanguage();
  const gallery = photos.slice(0, 10); // show up to 10 in carousel
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
  }, [gallery, updateButtons]);

  const scrollBy = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector('[data-gallery-card]');
    const cardW = card ? card.offsetWidth + 16 : 300;
    el.scrollBy({ left: dir * cardW, behavior: 'smooth' });
  };

  return (
    <section className="section-pad bg-church-cream" aria-label="Church gallery">
      <div className="page-container">
        <SectionHeading
          label={t('nav.gallery')}
          lang={lang}
          title={t('home.galleryTitle')}
          description={t('home.galleryDescription')}
          action={
            <Link to="/memories" className="btn-outline-navy px-6">
              {t('common.seeAllPhotos')}
            </Link>
          }
        />

        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-56 w-full shrink-0 animate-pulse rounded-2xl bg-gray-200 sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)]" />
            ))}
          </div>
        ) : gallery.length === 0 ? (
          <HomeAnim>
            <EmptyPanel
              icon={PhotoIcon}
              title={t('home.galleryEmptyTitle')}
              message={t('home.galleryEmptyMessage')}
              action={
                <Link to="/photos" className="btn-outline-navy px-6">
                  {t('common.seeAllPhotos')}
                </Link>
              }
            />
          </HomeAnim>
        ) : (
          <div className="relative">
            {/* Prev */}
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              disabled={!canPrev}
              aria-label="Previous photos"
              className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full border border-church-gold/30 bg-white shadow-card transition-all duration-200 hover:border-church-gold hover:bg-church-gold hover:text-white disabled:pointer-events-none disabled:opacity-30 sm:-left-5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-church-blue"><polyline points="15 18 9 12 15 6" /></svg>
            </button>

            {/* Next */}
            <button
              type="button"
              onClick={() => scrollBy(1)}
              disabled={!canNext}
              aria-label="Next photos"
              className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full border border-church-gold/30 bg-white shadow-card transition-all duration-200 hover:border-church-gold hover:bg-church-gold hover:text-white disabled:pointer-events-none disabled:opacity-30 sm:-right-5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-church-blue"><polyline points="9 18 15 12 9 6" /></svg>
            </button>

            {/* Track */}
            <div
              ref={trackRef}
              className="gdm-carousel-track flex gap-4 overflow-x-auto pb-2"
              style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {gallery.map((photo, index) => (
                <Link
                  key={photo.id || index}
                  to="/memories"
                  data-gallery-card=""
                  className="group relative h-56 w-[calc(100%-2rem)] shrink-0 overflow-hidden rounded-2xl bg-white shadow-card sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] xl:w-[calc(25%-12px)]"
                  style={{ scrollSnapAlign: 'start' }}
                  aria-label={photo.title || 'Church photo'}
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.title || 'Church photo'}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={fallbackImage}
                  />
                  <span className="absolute inset-0 bg-navy-950/0 transition-colors duration-300 group-hover:bg-navy-950/20" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function PrayerSection({ t }) {
  const { lang } = useLanguage();

  return (
    <section
      className="relative overflow-hidden py-20 sm:py-24"
      style={{
        backgroundImage: `url(${prayerBgImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      aria-label="Prayer request"
    >
      <div className="absolute inset-0 z-0 bg-[#08162b]/80" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        <div className="absolute left-1/2 top-10 h-64 w-64 -translate-x-1/2 rounded-full bg-church-gold/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-church-gold/[0.07] blur-3xl" />
      </div>

      <div className="page-container relative z-10">
        <HomeAnim className="mx-auto max-w-2xl text-center">
          <div className="home-prayer-dove mx-auto grid h-16 w-16 place-items-center overflow-hidden rounded-full border border-church-gold/50 bg-church-gold/10">
            <img src={doveImg} alt="" aria-hidden="true" className="h-11 w-11 object-contain" />
          </div>
          <Label light className="mt-5">
            <AnimatedText text={t('home.prayerRequests')} lang={lang} inline stagger={lang === 'te' ? 0.065 : 0.055} />
          </Label>
          <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-white sm:text-4xl">
            {t('home.prayerTitle')}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-white/75">
            {t('home.prayerDescription')}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/prayer" className="btn-gold h-11 w-full px-7 sm:w-auto">
              {t('common.submitPrayer')}
            </Link>
            <Link to="/offerings" className="btn-outline-light w-full px-7 sm:w-auto">
              {t('common.giveOffering')}
            </Link>
          </div>
        </HomeAnim>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { t, lang, dateLocale } = useLanguage();
  const [hero, setHero] = useState(null);
  const [churchInfo, setChurchInfo] = useState(null);
  const [events, setEvents] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [sermons, setSermons] = useState([]);
  const [pastors, setPastors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.classList.add('home-page-active');
    return () => document.body.classList.remove('home-page-active');
  }, []);

  useEffect(() => {
    Promise.allSettled([
      churchService.getHero(),
      churchService.getInfo(),
      eventService.getUpcoming(),
      eventService.getLatestPhotos(12),
      sermonService.list(0, 3),
      pastorService.list(),
    ]).then(([heroR, infoR, evR, phR, serR, pasR]) => {
      if (heroR.status === 'fulfilled') setHero(heroR.value.data.data);
      if (infoR.status === 'fulfilled') setChurchInfo(infoR.value.data.data);
      if (evR.status === 'fulfilled') setEvents(evR.value.data.data?.slice(0, 4) || []);
      if (phR.status === 'fulfilled') setPhotos(phR.value.data.data || []);
      if (serR.status === 'fulfilled') setSermons(serR.value.data.data?.content?.slice(0, 3) || []);
      if (pasR.status === 'fulfilled') setPastors(pasR.value.data.data?.slice(0, 3) || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="home-redesign bg-church-cream">
      <style>{HOME_STYLES}</style>
      <HeroSection hero={hero} />
      <WelcomeSection churchInfo={churchInfo} t={t} lang={lang} />
      <EventsSection events={events} loading={loading} t={t} />
      <SermonsSection sermons={sermons} loading={loading} t={t} dateLocale={dateLocale} />
      <PastorsSection pastors={pastors} t={t} />
      <GallerySection photos={photos} loading={loading} t={t} />
      <PrayerSection t={t} />
    </div>
  );
}
