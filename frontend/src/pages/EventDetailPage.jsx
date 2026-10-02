import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { Skeleton } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import { CalendarIcon, MapPinIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline';

function Lightbox({ photo, onClose }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <button className="absolute top-4 right-4 text-white" aria-label="Close lightbox">
        <XMarkIcon className="h-8 w-8" />
      </button>
      <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
        <img
          src={photo.imageUrl}
          alt={photo.title || 'Event photo'}
          className="w-full max-h-[80vh] object-contain rounded-lg"
        />
        {(photo.title || photo.description) && (
          <div className="text-white text-center mt-3">
            {photo.title && <p className="font-semibold">{photo.title}</p>}
            {photo.description && <p className="text-sm text-white/70 mt-1">{photo.description}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default function EventDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.allSettled([
      eventService.getById(id),
      eventService.getPhotos(id),
    ]).then(([eRes, pRes]) => {
      if (eRes.status === 'fulfilled') setEvent(eRes.value.data.data);
      else setError('Event not found.');
      if (pRes.status === 'fulfilled') setPhotos(pRes.value.data.data || []);
    }).finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-4">
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  );

  if (error || !event) return <ErrorState message={error || 'Event not found.'} onRetry={load} />;

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Back */}
      <Link to="/events" className="text-church-blue text-sm hover:underline mb-6 inline-block">
        ← Back to Events
      </Link>

      {/* Hero image */}
      {event.imageUrl && (
        <div className="rounded-2xl overflow-hidden mb-8 aspect-video w-full bg-gray-100">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <span className={`badge mb-3 inline-block ${
          event.status === 'UPCOMING' ? 'bg-green-100 text-green-700'
          : event.status === 'COMPLETED' ? 'bg-gray-100 text-gray-600'
          : event.status === 'CANCELLED' ? 'bg-red-100 text-red-600'
          : 'bg-blue-100 text-blue-700'
        }`}>
          {event.status}
        </span>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-church-blue mb-4">
          {event.title}
        </h1>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {event.eventDate && (
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4 text-church-blue" />
              {fmt(event.eventDate)}
            </span>
          )}
          {(event.startTime || event.endTime) && (
            <span className="flex items-center gap-1.5">
              <ClockIcon className="h-4 w-4 text-church-blue" />
              {event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}
            </span>
          )}
          {event.location && (
            <span className="flex items-center gap-1.5">
              <MapPinIcon className="h-4 w-4 text-church-blue" />
              {event.location}
            </span>
          )}
          {event.registrationRequired && (
            <span className="badge bg-amber-100 text-amber-700">Registration Required</span>
          )}
          {event.capacity && (
            <span className="text-gray-500">Capacity: {event.capacity}</span>
          )}
        </div>
      </div>

      {/* Description */}
      {event.description && (
        <div className="prose prose-lg max-w-none mb-10">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{event.description}</p>
        </div>
      )}

      {/* Event Photos */}
      {photos.length > 0 && (
        <div>
          <h2 className="text-2xl font-serif font-bold text-church-blue mb-6">
            Event Photos
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map(p => (
              <button
                key={p.id}
                onClick={() => setLightbox(p)}
                className="aspect-square rounded-lg overflow-hidden bg-gray-100 group"
                aria-label={p.title || 'View photo'}
              >
                <img
                  src={p.imageUrl}
                  alt={p.title || 'Event photo'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {lightbox && (
        <Lightbox photo={lightbox} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}
