import { useEffect, useState } from 'react';
import { eventService } from '../services/eventService';
import { Skeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import SectionHeader from '../components/SectionHeader';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import CrossDivider from '../components/ornaments/CrossDivider';
import { useLanguage } from '../context/LanguageContext';
import { localized } from '../utils/localized';

function Lightbox({ photo, onClose, t, lang }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const title = localized(photo, 'title', lang);
  const description = localized(photo, 'description', lang);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90" onClick={onClose}>
      <button className="absolute top-4 right-4 text-white" onClick={onClose} aria-label={t('common.close')}>
        <XMarkIcon className="h-8 w-8" />
      </button>
      <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
        <img src={photo.imageUrl} alt={title || t('common.photo')} className="w-full max-h-[80vh] object-contain rounded-lg" />
        {(title || description) && (
          <div className="text-white text-center mt-3">
            {title && <p className="font-semibold">{title}</p>}
            {description && <p className="text-sm text-white/70">{description}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PhotosPage() {
  const { t, lang } = useLanguage();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    eventService.getLatestPhotos(60)
      .then(r => setPhotos(r.data.data || []))
      .catch(() => setPhotos([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <SectionHeader title={t('photos.title')} subtitle={t('photos.subtitle')} />
      <CrossDivider className="mb-8" opacity={0.3} />

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 15 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <EmptyState icon={PhotoIcon} title={t('photos.noPhotos')} message={t('photos.photosHere')} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {photos.map(p => {
            const title = localized(p, 'title', lang);
            return (
              <button
                key={p.id}
                className="aspect-square overflow-hidden rounded-lg bg-gray-100 group"
                onClick={() => setLightbox(p)}
                aria-label={title || t('photos.viewPhoto')}
              >
                <img
                  src={p.imageUrl}
                  alt={title || t('common.eventPhoto')}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      )}

      {lightbox && <Lightbox photo={lightbox} onClose={() => setLightbox(null)} t={t} lang={lang} />}
    </div>
  );
}
