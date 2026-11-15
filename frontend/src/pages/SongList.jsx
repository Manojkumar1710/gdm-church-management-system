import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { songService } from '../services/songService';
import { CardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import SectionHeader from '../components/SectionHeader';
import { MagnifyingGlassIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../context/LanguageContext';

export default function SongList() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Debounce search input by 300 ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch songs whenever the debounced search changes
  useEffect(() => {
    setLoading(true);
    songService
      .list(debouncedSearch)
      .then((r) => setSongs(r.data.data || []))
      .catch(() => setSongs([]))
      .finally(() => setLoading(false));
  }, [debouncedSearch]);

  return (
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <SectionHeader title={t('songs.title')} subtitle={t('songs.subtitle')} />

      {/* Search bar */}
      <div className="relative mb-10 max-w-xl mx-auto">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('songs.searchPlaceholder')}
          className="w-full pl-12 pr-4 py-3 border border-church-border rounded-2xl text-sm bg-white outline-none
                     focus:border-church-blue focus:ring-2 focus:ring-church-blue/10 transition-all"
          aria-label={t('common.search')}
        />
      </div>

      {/* Song list */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : songs.length === 0 ? (
        <EmptyState
          icon={MusicalNoteIcon}
          title={t('songs.noSongs')}
          message={t('songs.noSongsHint')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {songs.map((song) => (
            <Link
              key={song.id}
              to={`/songs/${song.id}`}
              className="card h-full p-5 flex items-center gap-4 min-h-[5.5rem]"
            >
              <span className="shrink-0 grid h-14 min-w-[4.5rem] place-items-center rounded-xl bg-church-blue/10 text-church-blue font-bold text-lg tabular-nums">
                {song.songNumber ?? '—'}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 font-telugu leading-relaxed break-words">
                  {song.titleTe}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mt-1 break-words">
                  {song.titleEn}
                </p>
                {song.category && song.category !== 'General' && (
                  <span className="inline-block mt-2 badge bg-church-light text-church-blue text-xs">
                    {song.category}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
