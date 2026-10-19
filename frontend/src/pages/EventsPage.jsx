import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { CardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import SectionHeader from '../components/SectionHeader';
import { CalendarIcon } from '@heroicons/react/24/outline';
import CrossDivider from '../components/ornaments/CrossDivider';
import { useLanguage } from '../context/LanguageContext';

export default function EventsPage() {
  const { t, dateLocale } = useLanguage();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const load = (p = 0) => {
    setLoading(true); setError(null);
    eventService.list(p, 12)
      .then(r => {
        const data = r.data.data;
        setEvents(data.content);
        setTotalPages(data.totalPages);
        setPage(p);
      })
      .catch(() => setError(t('events.loadError')))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(0), []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <SectionHeader title={t('events.title')} subtitle={t('events.subtitle')} />
      <CrossDivider className="mb-8" opacity={0.3} />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => load(page)} />
      ) : events.length === 0 ? (
        <EmptyState icon={CalendarIcon} title={t('events.noEvents')} message={t('events.checkBack')} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {events.map(event => (
              <Link key={event.id} to={`/events/${event.id}`} className="card hover:scale-[1.02] transition-transform">
                {event.imageUrl ? (
                  <img src={event.imageUrl} alt={event.title} className="w-full h-44 object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-44 bg-church-light flex items-center justify-center">
                    <CalendarIcon className="h-12 w-12 text-gray-300" />
                  </div>
                )}
                <div className="p-4">
                  <span className={`badge mb-2 inline-block ${
                    event.status === 'UPCOMING' ? 'bg-green-100 text-green-700' :
                    event.status === 'COMPLETED' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'
                  }`}>{event.status}</span>
                  <h3 className="font-semibold text-gray-800 mb-1">{event.title}</h3>
                  <p className="text-xs text-gray-500">
                    📅 {new Date(event.eventDate).toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  {event.location && <p className="text-xs text-gray-500 mt-0.5">📍 {event.location}</p>}
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <button onClick={() => load(page - 1)} disabled={page === 0} className="btn-secondary py-2 px-4 text-sm disabled:opacity-30">{t('common.prev')}</button>
              <span className="py-2 px-4 text-sm text-gray-500">{t('common.page')} {page + 1} {t('common.of')} {totalPages}</span>
              <button onClick={() => load(page + 1)} disabled={page >= totalPages - 1} className="btn-secondary py-2 px-4 text-sm disabled:opacity-30">{t('common.next')}</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
