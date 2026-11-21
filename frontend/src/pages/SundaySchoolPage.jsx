import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { sundaySchoolService } from '../services/sundaySchoolService';
import { galleryService } from '../services/galleryService';
import { CardSkeleton, Skeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import SectionHeader from '../components/SectionHeader';
import Reveal from '../components/motion/Reveal';
import Stagger, { StaggerItem } from '../components/motion/Stagger';
import AnimatedText from '../components/motion/AnimatedText';
import {
  AcademicCapIcon,
  ArrowRightIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  HeartIcon,
  MapPinIcon,
  PhotoIcon,
  SparklesIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import CrossDivider from '../components/ornaments/CrossDivider';
import heroBibleImg from '../assets/images/hero-bible.jpg';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useLanguage } from '../context/LanguageContext';

const EASE = [0.22, 1, 0.36, 1];

const HERO_IMAGE = 'https://images.pexels.com/photos/8535177/pexels-photo-8535177.jpeg?auto=compress&cs=tinysrgb&w=1600';
const FEATURE_IMAGES = {
  children: 'https://images.pexels.com/photos/8466778/pexels-photo-8466778.jpeg?auto=compress&cs=tinysrgb&w=900',
  teachers: 'https://images.pexels.com/photos/8613091/pexels-photo-8613091.jpeg?auto=compress&cs=tinysrgb&w=900',
  programs: 'https://images.pexels.com/photos/28822568/pexels-photo-28822568.jpeg?auto=compress&cs=tinysrgb&w=900',
};

const FEATURES = [
  { titleKey: 'sundaySchool.children', descKey: 'sundaySchool.childrenDesc', image: FEATURE_IMAGES.children, Icon: UserGroupIcon },
  { titleKey: 'sundaySchool.teachers', descKey: 'sundaySchool.teachersDesc', image: FEATURE_IMAGES.teachers, Icon: AcademicCapIcon },
  { titleKey: 'sundaySchool.programs', descKey: 'sundaySchool.programsDesc', image: FEATURE_IMAGES.programs, Icon: SparklesIcon },
];

const LEARN_ITEMS = [
  { titleKey: 'sundaySchool.learnBible', descKey: 'sundaySchool.learnBibleDesc', Icon: BookOpenIcon },
  { titleKey: 'sundaySchool.learnValues', descKey: 'sundaySchool.learnValuesDesc', Icon: HeartIcon },
  { titleKey: 'sundaySchool.learnPrayer', descKey: 'sundaySchool.learnPrayerDesc', Icon: SparklesIcon },
  { titleKey: 'sundaySchool.learnFellowship', descKey: 'sundaySchool.learnFellowshipDesc', Icon: UserGroupIcon },
];

export default function SundaySchoolPage() {
  const { t, lang, dateLocale } = useLanguage();
  const reduced = useReducedMotion();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [galleryItems, setGalleryItems] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(true);

  const load = (p = 0) => {
    setLoading(true);
    sundaySchoolService.getPrograms(p, 12)
      .then(r => {
        const d = r.data.data;
        setPrograms(d.content);
        setTotalPages(d.totalPages);
        setPage(p);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => load(0), []);

  useEffect(() => {
    let active = true;
    galleryService.list(0, 8)
      .then(r => {
        if (active) setGalleryItems(r.data.data?.content || []);
      })
      .catch(() => {
        if (active) setGalleryItems([]);
      })
      .finally(() => {
        if (active) setGalleryLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <div className="overflow-hidden bg-church-cream">
      <section className="relative isolate bg-church-blue text-white">
        <motion.img
          src={HERO_IMAGE}
          alt=""
          aria-hidden="true"
          onError={e => { e.currentTarget.src = heroBibleImg; }}
          className="absolute inset-0 h-full w-full object-cover object-center"
          initial={reduced ? false : { scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.4, ease: EASE }}
        />
        <div className="absolute inset-0 bg-church-blue/75" aria-hidden="true" />
        <div className="relative mx-auto flex min-h-[320px] max-w-7xl items-center px-4 py-10 sm:px-6 sm:py-12 lg:min-h-[360px] lg:px-8">
          <div className="max-w-2xl">
            <motion.div
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-church-gold"
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <SparklesIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {t('sundaySchool.title')}
            </motion.div>

            <h1 className="font-serif text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              <AnimatedText text={t('sundaySchool.heroTitle')} lang={lang} />
            </h1>

            <motion.p
              className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base"
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.22, ease: EASE }}
            >
              {t('sundaySchool.heroDescription')}
            </motion.p>

            <motion.div
              className="mt-6 flex flex-col gap-3 sm:flex-row"
              initial={reduced ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.34, ease: EASE }}
            >
              <a
                href="#sunday-school-programs"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-church-gold px-6 py-3 text-sm font-bold text-church-blue shadow-card transition-colors hover:bg-church-gold/90"
              >
                {t('sundaySchool.heroPrimary')}
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="#sunday-school-teachers"
                className="inline-flex items-center justify-center rounded-xl border border-white/50 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                {t('sundaySchool.heroSecondary')}
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="sunday-school-features" className="scroll-mt-20 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeader title={t('sundaySchool.title')} subtitle={t('sundaySchool.tagline')} />
          </Reveal>
          <CrossDivider className="mb-10" opacity={0.3} />

          <Stagger className="grid gap-6 md:grid-cols-3" staggerDelay={0.1}>
            {FEATURES.map(feature => {
              const FeatureIcon = feature.Icon;
              return (
                <StaggerItem key={feature.titleKey}>
                  <motion.article
                    id={feature.titleKey === 'sundaySchool.teachers' ? 'sunday-school-teachers' : undefined}
                    whileHover={reduced ? undefined : { y: -5 }}
                    transition={{ duration: 0.3 }}
                    className="group flex h-full scroll-mt-24 flex-col overflow-hidden rounded-2xl border border-church-border bg-white shadow-card transition-shadow duration-300 hover:shadow-card-hover"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-church-light">
                      <img
                        src={feature.image}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
                      />
                      <span className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-xl bg-white/90 text-church-gold shadow-sm transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none">
                        <FeatureIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="font-serif text-lg font-bold text-church-blue">{t(feature.titleKey)}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600">{t(feature.descKey)}</p>
                    </div>
                  </motion.article>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      <section id="sunday-school-programs" className="scroll-mt-20 bg-church-cream py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeader title={t('sundaySchool.programsTitle')} subtitle={t('sundaySchool.programsSub')} />
          </Reveal>
          <CrossDivider className="mb-10" opacity={0.3} />

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
            </div>
          ) : programs.length === 0 ? (
            <EmptyState
              icon={AcademicCapIcon}
              title={t('sundaySchool.noPrograms')}
              message={t('sundaySchool.programsHere')}
            />
          ) : (
            <>
              <Stagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3" staggerDelay={0.08}>
                {programs.map(p => (
                  <StaggerItem key={p.id}>
                    <motion.article
                      whileHover={reduced ? undefined : { y: -4 }}
                      transition={{ duration: 0.3 }}
                      className="card flex h-full flex-col overflow-hidden transition-shadow duration-300 hover:shadow-card-hover"
                    >
                      {p.imageUrl ? (
                        <div className="aspect-[4/3] overflow-hidden bg-church-light">
                          <img
                            src={p.imageUrl}
                            alt={p.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105 motion-reduce:transform-none"
                          />
                        </div>
                      ) : (
                        <div className="flex aspect-[4/3] items-center justify-center bg-church-light">
                          <AcademicCapIcon className="h-12 w-12 text-church-gold/70" aria-hidden="true" />
                        </div>
                      )}
                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="font-serif font-semibold text-church-blue">{p.title}</h3>
                        {p.programDate && (
                          <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                            <CalendarDaysIcon className="h-3.5 w-3.5 text-church-gold" aria-hidden="true" />
                            {new Date(p.programDate).toLocaleDateString(dateLocale, {
                              day: 'numeric', month: 'long', year: 'numeric'
                            })}
                          </p>
                        )}
                        {p.location && (
                          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500">
                            <MapPinIcon className="h-3.5 w-3.5 text-church-gold" aria-hidden="true" />
                            {p.location}
                          </p>
                        )}
                        {p.description && (
                          <p className="mt-3 text-sm leading-relaxed text-gray-600 line-clamp-3">{p.description}</p>
                        )}
                        {p.videoUrl && (
                          <a
                            href={p.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-church-blue hover:underline"
                          >
                            {t('sundaySchool.watchVideo')}
                            <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    </motion.article>
                  </StaggerItem>
                ))}
              </Stagger>

              {totalPages > 1 && (
                <div className="mt-10 flex justify-center gap-2">
                  <button
                    onClick={() => load(page - 1)}
                    disabled={page === 0}
                    className="btn-secondary py-2 px-4 text-sm disabled:opacity-30"
                  >{t('common.prev')}</button>
                  <span className="py-2 px-4 text-sm text-gray-500">
                    {t('common.page')} {page + 1} {t('common.of')} {totalPages}
                  </span>
                  <button
                    onClick={() => load(page + 1)}
                    disabled={page >= totalPages - 1}
                    className="btn-secondary py-2 px-4 text-sm disabled:opacity-30"
                  >{t('common.next')}</button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-church-gold">{t('sundaySchool.title')}</p>
            <h2 className="mt-2 font-serif text-2xl font-bold text-church-blue sm:text-3xl">{t('sundaySchool.learnTitle')}</h2>
          </Reveal>
          <CrossDivider className="mb-10 mt-6" opacity={0.25} />

          <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.08}>
            {LEARN_ITEMS.map(item => {
              const ItemIcon = item.Icon;
              return (
                <StaggerItem key={item.titleKey}>
                  <motion.div
                    whileHover={reduced ? undefined : { y: -4 }}
                    transition={{ duration: 0.3 }}
                    className="group h-full rounded-2xl border border-church-border bg-church-cream/60 p-6 text-center shadow-card transition-shadow duration-300 hover:shadow-card-hover"
                  >
                    <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-church-gold/10 text-church-gold ring-1 ring-church-gold/20 transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none">
                      <ItemIcon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className="font-serif text-base font-bold text-church-blue">{t(item.titleKey)}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{t(item.descKey)}</p>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      <section className="bg-church-cream py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <h2 className="font-serif text-2xl font-bold text-church-blue sm:text-3xl">{t('sundaySchool.galleryTitle')}</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-600">{t('sundaySchool.gallerySubtitle')}</p>
          </Reveal>
          <CrossDivider className="mb-10 mt-6" opacity={0.25} />

          {galleryLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
            </div>
          ) : galleryItems.length === 0 ? (
            <EmptyState icon={PhotoIcon} title={t('sundaySchool.galleryEmpty')} />
          ) : (
            <>
              <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4" staggerDelay={0.05}>
                {galleryItems.slice(0, 8).map(item => (
                  <StaggerItem key={item.id}>
                    <a
                      href={item.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block aspect-square overflow-hidden rounded-xl bg-church-light shadow-card"
                      aria-label={item.title || t('sundaySchool.galleryTitle')}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title || t('sundaySchool.galleryTitle')}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
                      />
                    </a>
                  </StaggerItem>
                ))}
              </Stagger>
              <div className="mt-8 text-center">
                <Link to="/gallery" className="btn-secondary inline-flex items-center gap-2 py-2 px-4 text-sm">
                  {t('common.viewAll')}
                  <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-church-blue py-16 text-center text-white sm:py-20">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-church-gold/10 blur-3xl" aria-hidden="true" />
        <Reveal className="mx-auto max-w-2xl px-4 sm:px-6">
          <CrossDivider className="mb-6" opacity={0.3} />
          <h2 className="font-serif text-3xl font-bold sm:text-4xl">{t('sundaySchool.ctaTitle')}</h2>
          <p className="mt-4 text-sm leading-relaxed text-white/75 sm:text-base">{t('sundaySchool.ctaDescription')}</p>
          <Link
            to="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-church-gold px-6 py-3 text-sm font-bold text-church-blue transition-colors hover:bg-church-gold/90"
          >
            {t('sundaySchool.ctaButton')}
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
