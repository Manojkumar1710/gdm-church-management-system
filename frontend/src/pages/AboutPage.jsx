import { useEffect, useState } from 'react';
import { churchService } from '../services/churchService';
import { Skeleton } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';

export default function AboutPage() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    churchService.getInfo()
      .then(r => setInfo(r.data.data))
      .catch(() => setError('Unable to load church information.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-4">
      <Skeleton className="h-10 w-1/2 mx-auto" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!info) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-4xl font-serif font-bold text-church-blue text-center mb-2">{info.name}</h1>
      {info.tagline && <p className="text-center text-gray-500 text-lg mb-12 italic">{info.tagline}</p>}

      <div className="space-y-10">
        {info.description && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-church-blue mb-3">About Us</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{info.description}</p>
          </div>
        )}
        {info.history && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-church-blue mb-3">Our History</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{info.history}</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {info.vision && (
            <div className="bg-church-light p-6 rounded-xl border-l-4 border-church-blue">
              <h3 className="font-bold text-church-blue mb-2">Our Vision</h3>
              <p className="text-gray-700 text-sm">{info.vision}</p>
            </div>
          )}
          {info.mission && (
            <div className="bg-church-light p-6 rounded-xl border-l-4 border-church-gold">
              <h3 className="font-bold text-church-blue mb-2">Our Mission</h3>
              <p className="text-gray-700 text-sm">{info.mission}</p>
            </div>
          )}
        </div>
        <div className="bg-church-blue text-white p-6 rounded-xl">
          <h3 className="font-bold text-lg mb-3 text-church-gold">Find Us</h3>
          <div className="space-y-1 text-white/80 text-sm">
            {info.address && <p>📍 {info.address}</p>}
            {info.phone && <p>📞 {info.phone}</p>}
            {info.email && <p>✉️ {info.email}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
