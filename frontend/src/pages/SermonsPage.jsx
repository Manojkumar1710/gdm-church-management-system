import { useEffect, useState } from 'react';
import { sermonService, youtubeService } from '../services/sermonService';
import { CardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import SectionHeader from '../components/SectionHeader';
import { getYoutubeId, getYoutubeThumbnail, getYoutubeEmbed } from '../utils/youtube';
import { BookOpenIcon, PlayIcon } from '@heroicons/react/24/outline';

/* ── YouTube thumbnail with fallback ──────────────────────────── */
function YTThumb({ url, title, fallbackThumb }) {
  const ytId  = getYoutubeId(url);
  const thumb = fallbackThumb || getYoutubeThumbnail(url);
  const embed = getYoutubeEmbed(url);

  const [showEmbed, setShowEmbed] = useState(false);
  const [imgError,  setImgError]  = useState(false);

  if (showEmbed && embed) {
    return (
      <iframe
        src={embed}
        className="w-full h-44"
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <button
      onClick={() => embed ? setShowEmbed(true) : window.open(url, '_blank')}
      className="relative w-full h-44 overflow-hidden group bg-church-blue"
      aria-label={`Play ${title}`}
    >
      {thumb && !imgError ? (
        <img
          src={thumb}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-church-blue">
          <BookOpenIcon className="h-12 w-12 text-white/20" />
        </div>
      )}
      {/* Play overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/25 transition-colors">
        <div className="w-14 h-14 rounded-full bg-black/60 flex items-center justify-center group-hover:bg-red-600 transition-colors shadow-lg">
          <PlayIcon className="h-6 w-6 text-white ml-0.5" />
        </div>
      </div>
    </button>
  );
}

/* ── Sermon card ───────────────────────────────────────────────── */
function SermonCard({ s }) {
  const hasVideo = Boolean(s.videoUrl && getYoutubeId(s.videoUrl));
  return (
    <div className="card flex flex-col overflow-hidden">
      {s.videoUrl
        ? <YTThumb url={s.videoUrl} title={s.title} fallbackThumb={s.thumbnailUrl} />
        : s.thumbnailUrl
          ? <img src={s.thumbnailUrl} alt={s.title} className="w-full h-44 object-cover" loading="lazy" />
          : <div className="w-full h-44 bg-church-blue flex items-center justify-center"><BookOpenIcon className="h-12 w-12 text-white/20" /></div>
      }
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{s.title}</h3>
        <p className="text-xs text-gray-500">{[s.speaker, s.sermonDate].filter(Boolean).join(' · ')}</p>
        {s.description && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{s.description}</p>}
        {s.videoUrl && !hasVideo && (
          <a href={s.videoUrl} target="_blank" rel="noopener noreferrer"
             className="mt-3 text-xs text-church-blue font-medium hover:underline">
            Watch on YouTube ↗
          </a>
        )}
      </div>
    </div>
  );
}

/* ── YouTube video card ────────────────────────────────────────── */
function VideoCard({ v }) {
  return (
    <div className="card flex flex-col overflow-hidden">
      <YTThumb url={v.youtubeUrl} title={v.title} fallbackThumb={v.thumbnailUrl} />
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{v.title}</h3>
        {v.category && (
          <span className="badge bg-blue-50 text-blue-600 text-xs w-fit mb-2">{v.category}</span>
        )}
        {v.description && <p className="text-sm text-gray-500 line-clamp-2">{v.description}</p>}
        <a href={v.youtubeUrl} target="_blank" rel="noopener noreferrer"
           className="mt-auto pt-3 text-xs text-gray-400 hover:text-church-blue transition-colors">
          Open on YouTube ↗
        </a>
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────── */
export default function SermonsPage() {
  const [sermons, setSermons] = useState([]);
  const [videos,  setVideos]  = useState([]);
  const [tab,     setTab]     = useState('sermons');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      sermonService.list(0, 20),
      youtubeService.list(0, 20),
    ]).then(([sRes, yRes]) => {
      if (sRes.status === 'fulfilled') setSermons(sRes.value.data.data?.content || []);
      if (yRes.status === 'fulfilled') setVideos(yRes.value.data.data?.content  || []);
    }).finally(() => setLoading(false));
  }, []);

  const tabs = [
    { key: 'sermons',  label: '📖 Sermons',       count: sermons.length },
    { key: 'youtube',  label: '▶ YouTube Videos', count: videos.length  },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <SectionHeader title="Sermons & Media" subtitle="Be inspired, encouraged and equipped through the Word" />

      {/* Tab switcher */}
      <div className="flex gap-2 justify-center mb-10 bg-gray-100 rounded-2xl p-1.5 max-w-sm mx-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              tab === t.key
                ? 'bg-white text-church-blue shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            {!loading && t.count > 0 && (
              <span className="ml-1.5 text-xs text-gray-400">({t.count})</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : tab === 'sermons' ? (
        sermons.length === 0
          ? <EmptyState icon={BookOpenIcon} title="No sermons yet" message="Sermons will appear here when they are published." />
          : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {sermons.map(s => <SermonCard key={s.id} s={s} />)}
            </div>
      ) : (
        videos.length === 0
          ? <EmptyState title="No YouTube videos yet" message="YouTube videos will appear here when they are added." />
          : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {videos.map(v => <VideoCard key={v.id} v={v} />)}
            </div>
      )}
    </div>
  );
}
