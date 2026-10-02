import { useEffect, useState } from 'react';
import { pastorService } from '../services/pastorService';
import { CardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import SectionHeader from '../components/SectionHeader';
import { UserGroupIcon } from '@heroicons/react/24/outline';

export default function PastorsPage() {
  const [pastors, setPastors] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      pastorService.list(),
      pastorService.getSchedule(),
    ]).then(([pRes, sRes]) => {
      if (pRes.status === 'fulfilled') setPastors(pRes.value.data.data || []);
      if (sRes.status === 'fulfilled') setSchedule(sRes.value.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <SectionHeader title="Our Pastors" subtitle="Dedicated shepherds serving our congregation" />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : pastors.length === 0 ? (
        <EmptyState icon={UserGroupIcon} title="No pastors listed" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {pastors.map(p => (
            <div key={p.id} className="card p-6 text-center">
              {p.photoUrl ? (
                <img src={p.photoUrl} alt={p.name} className="w-28 h-28 rounded-full object-cover mx-auto mb-4 border-4 border-church-light" loading="lazy" />
              ) : (
                <div className="w-28 h-28 rounded-full bg-church-blue flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
                  {p.name.charAt(0)}
                </div>
              )}
              <h3 className="text-lg font-serif font-bold text-church-blue">{p.name}</h3>
              {p.village && <p className="text-sm text-gray-500 mt-0.5">📍 {p.village}</p>}
              {p.contactPublic && p.contactNumber && (
                <p className="text-sm text-gray-500 mt-0.5">📞 {p.contactNumber}</p>
              )}
              {p.bio && <p className="text-sm text-gray-600 mt-3 leading-relaxed line-clamp-3">{p.bio}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Service Schedule */}
      {schedule.length > 0 && (
        <div className="mt-16">
          <SectionHeader title="Service Schedule" subtitle="Pastor assignments for upcoming services" />
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-sm border border-gray-100">
              <thead className="bg-church-blue text-white text-sm">
                <tr>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Service</th>
                  <th className="text-left px-4 py-3">Pastor</th>
                  <th className="text-left px-4 py-3">Village</th>
                  <th className="text-left px-4 py-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {schedule.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 text-sm">
                    <td className="px-4 py-3">
                      {new Date(s.serviceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">{s.serviceType || 'Sunday Service'}</td>
                    <td className="px-4 py-3 font-medium">{s.pastorName}</td>
                    <td className="px-4 py-3 text-gray-500">{s.pastorVillage}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {s.startTime || ''}{s.endTime ? ` – ${s.endTime}` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
