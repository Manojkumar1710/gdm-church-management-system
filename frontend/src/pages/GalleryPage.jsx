import { useEffect, useState } from 'react';
import { galleryService } from '../services/galleryService';
import { Skeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import SectionHeader from '../components/SectionHeader';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const load = (p = 0) => {
    setLoading(true);
    galleryService.list(p, 20)
      .then(r => {
        const d = r.data.data;
        setItems(d.content);
        setTotalPages(d.totalPages);
        setPage(p);
      }).finally(() => setLoading(false));
  };

  useEffect(() => load(0), []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <SectionHeader title="Gallery" subtitle="A glimpse of our church life and community" />

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={PhotoIcon} title="No gallery items" />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {items.map(item => (
              <button key={item.id} onClick={() => setLightbox(item)}
                className="aspect-square overflow-hidden rounded-lg bg-gray-100 group" aria-label={item.title || 'Gallery photo'}>
                <img src={item.imageUrl} alt={item.title || 'Gallery'} loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </button>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button onClick={() => load(page - 1)} disabled={page === 0} className="btn-secondary py-2 px-4 text-sm disabled:opacity-30">← Prev</button>
              <button onClick={() => load(page + 1)} disabled={page >= totalPages - 1} className="btn-secondary py-2 px-4 text-sm disabled:opacity-30">Next →</button>
            </div>
          )}
        </>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white" onClick={() => setLightbox(null)}><XMarkIcon className="h-8 w-8" /></button>
          <div className="max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <img src={lightbox.imageUrl} alt={lightbox.title} className="w-full max-h-[80vh] object-contain rounded-lg" />
            {lightbox.title && <p className="text-white text-center mt-2 font-medium">{lightbox.title}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
