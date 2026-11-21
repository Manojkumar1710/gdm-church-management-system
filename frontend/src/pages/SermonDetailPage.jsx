import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { sermonService } from '../services/sermonService';
import {
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  BookOpenIcon,
  CalendarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { getYoutubeId, getYoutubeEmbed } from '../utils/youtube';
import { useLanguage } from '../context/LanguageContext';
import { localized } from '../utils/localized';
import { CardSkeleton } from '../components/Skeleton';

function formatDate(value, dateLocale) {
  if (!value) return '';
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' });
}

function VideoPlayer({ videoUrl, thumbnailUrl, title, t }) {
  const youtubeId = getYoutubeId(videoUrl);
  const embedUrl = youtubeId ? getYoutubeEmbed(videoUrl) : null;

  if (!videoUrl) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-church-blue/10">
        <BookOpenIcon className="h-16 w-16 text-church-blue/30" />
      </div>
    );
  }

  if (embedUrl) {
    return (
      <div className="relative w-full overflow-hidden rounded-2xl bg-black shadow-xl"
           style={{ paddingTop: '56.25%' }}>
        <iframe
          src={`${embedUrl}&autoplay=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  /* Fallback: non-embeddable URL — show thumbnail with open button */
  return (
    <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl bg-church-blue shadow-xl">
      {thumbnailUrl && (
        <img src={thumbnailUrl} alt={title} className="absolute inset-0 h-full w-full object-cover opacity-60" />
      )}
      <div className="relative z-10 flex flex-col items-center gap-4 text-center px-6">
        <BookOpenIcon className="h-14 w-14 text-white/60" />
        <p className="text-sm text-white/80">{t('sermonDetail.noEmbed')}</p>
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-church-gold px-5 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-church-gold/90"
        >
          {t('common.watchOnYoutube')}
          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

export default function SermonDetailPage() {
  const { id } = useParams();
  const { t, lang, dateLocale } = useLanguage();
  const [sermon, setSermon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    sermonService.getById(id)
      .then(r => setSermon(r.data.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const title = sermon ? (localized(sermon, 'title', lang) || sermon.title) : '';
  const description = sermon ? (localized(sermon, 'description', lang) || sermon.description) : '';
  const speaker = sermon ? (localized(sermon, 'speaker', lang) || sermon.speaker) : '';

  return (
    <div className="min-h-screen bg-church-cream">
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          to="/sermons"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-church-blue hover:text-church-gold transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {t('sermonDetail.backToSermons')}
        </Link>

        {loading ? (
          <div className="mt-4 space-y-4">
            <div className="aspect-video w-full animate-pulse rounded-2xl bg-gray-200" />
            <div className="animate-pulse rounded-2xl bg-gray-200 h-8 w-3/4" />
            <div className="animate-pulse rounded-2xl bg-gray-200 h-4 w-1/2" />
            <CardSkeleton />
          </div>
        ) : error || !sermon ? (
          <div className="mt-10 rounded-3xl border border-church-gold/20 bg-white px-8 py-16 text-center shadow-card">
            <BookOpenIcon className="mx-auto h-14 w-14 text-church-blue/20" />
            <h2 className="mt-5 font-serif text-2xl font-bold text-church-blue">
              {t('sermonDetail.notFound')}
            </h2>
            <p className="mt-3 text-sm text-gray-500">{t('sermonDetail.notFoundMessage')}</p>
            <Link to="/sermons" className="btn-primary mt-6 inline-flex">
              {t('sermonDetail.backToSermons')}
            </Link>
          </div>
        ) : (
          <article>
            {/* Video player */}
            <VideoPlayer
              videoUrl={sermon.videoUrl}
              thumbnailUrl={sermon.thumbnailUrl}
              title={title}
              t={t}
            />

            {/* Info section */}
            <div className="mt-8 rounded-3xl border border-church-gold/20 bg-white p-6 shadow-card sm:p-8">
              <h1 className="font-serif text-2xl font-bold leading-tight text-church-blue sm:text-3xl">
                {title}
              </h1>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-church-blue/70">
                {speaker && (
                  <span className="flex items-center gap-1.5">
                    <UserIcon className="h-4 w-4 shrink-0 text-church-gold" aria-hidden="true" />
                    {speaker}
                  </span>
                )}
                {sermon.sermonDate && (
                  <span className="flex items-center gap-1.5">
                    <CalendarIcon className="h-4 w-4 shrink-0 text-church-gold" aria-hidden="true" />
                    {formatDate(sermon.sermonDate, dateLocale)}
                  </span>
                )}
              </div>

              {sermon.videoUrl && (
                <a
                  href={sermon.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-church-gold/40 bg-church-gold/10 px-4 py-2 text-sm font-semibold text-church-blue hover:bg-church-gold/20 transition-colors"
                >
                  {t('common.watchOnYoutube')}
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                </a>
              )}

              {description && (
                <div className="mt-6 border-t border-church-gold/15 pt-6">
                  <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-church-gold">
                    {t('sermonDetail.about')}
                  </h2>
                  <p className="whitespace-pre-wrap text-sm leading-8 text-gray-700 sm:text-base">
                    {description}
                  </p>
                </div>
              )}
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
