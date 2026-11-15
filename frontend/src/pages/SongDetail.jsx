import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { songService } from '../services/songService';
import { useLanguage } from '../context/LanguageContext';

export default function SongDetail() {
  const { id } = useParams();
  const { t } = useLanguage();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Local state — independent of the global site language switcher
  const [lang, setLang] = useState('both'); // 'te' | 'en' | 'both'
  const [fontSize, setFontSize] = useState(18);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    songService
      .getById(id)
      .then((r) => setSong(r.data.data))
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-church-blue border-t-transparent rounded-full" />
      </div>
    );
  }

  if (notFound || !song) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-6xl mb-4">🎶</p>
        <h1 className="text-2xl font-bold text-church-blue mb-2">
          {t('songs.songNotFound')}
        </h1>
        <Link to="/songs" className="btn-primary btn-sm mt-4 inline-flex">
          {t('songs.backToSongs')}
        </Link>
      </div>
    );
  }

  const langButtons = [
    { key: 'te', label: t('songs.telugu') },
    { key: 'en', label: t('songs.english') },
    { key: 'both', label: t('songs.both') },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      {/* Back link */}
      <Link
        to="/songs"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-church-blue mb-6 transition-colors"
      >
        ← {t('songs.backToSongs')}
      </Link>

      {/* Header */}
      <div className="mb-8 text-center">
        {song.songNumber != null && (
          <span className="inline-block px-3 py-1 rounded-full bg-church-blue/10 text-church-blue text-sm font-semibold mb-3">
            #{song.songNumber}
          </span>
        )}
        <h1 className="text-2xl md:text-3xl font-bold text-church-blue font-telugu break-words leading-snug">
          {song.titleTe}
        </h1>
        <p className="text-lg text-gray-500 mt-2 break-words">{song.titleEn}</p>
        {song.category && song.category !== 'General' && (
          <span className="inline-block mt-3 badge bg-church-light text-church-blue text-xs">
            {song.category}
          </span>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
        {/* Language toggle */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {langButtons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => setLang(btn.key)}
              className={`h-9 px-4 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                lang === btn.key
                  ? 'bg-white text-church-blue shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Font size toggle */}
        <div className="flex items-center gap-2 h-11">
          <button
            onClick={() => setFontSize((f) => Math.max(14, f - 2))}
            disabled={fontSize <= 14}
            className="h-9 w-9 shrink-0 rounded-lg border border-church-border text-gray-600 hover:bg-church-light
                       disabled:opacity-40 transition-colors flex items-center justify-center text-sm font-bold"
            aria-label="Decrease font size"
          >
            A−
          </button>
          <span className="text-xs text-gray-400 w-10 text-center tabular-nums shrink-0">
            {fontSize}px
          </span>
          <button
            onClick={() => setFontSize((f) => Math.min(32, f + 2))}
            disabled={fontSize >= 32}
            className="h-9 w-9 shrink-0 rounded-lg border border-church-border text-gray-600 hover:bg-church-light
                       disabled:opacity-40 transition-colors flex items-center justify-center text-base font-bold"
            aria-label="Increase font size"
          >
            A+
          </button>
        </div>
      </div>

      {/* Lyrics */}
      <div className="card p-6 sm:p-8">
        {lang !== 'en' && (
          <div className={lang === 'both' ? 'mb-6 pb-6 border-b border-church-border' : ''}>
            {lang === 'both' && (
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">
                {t('songs.telugu')}
              </h2>
            )}
            <p
              className="font-telugu whitespace-pre-line text-gray-800"
              style={{ fontSize: `${fontSize}px`, lineHeight: 1.9 }}
            >
              {song.lyricsTe}
            </p>
          </div>
        )}
        {lang !== 'te' && (
          <div>
            {lang === 'both' && (
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">
                {t('songs.english')}
              </h2>
            )}
            <p
              className="whitespace-pre-line text-gray-800"
              style={{ fontSize: `${fontSize}px`, lineHeight: 1.7 }}
            >
              {song.lyricsEn}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
