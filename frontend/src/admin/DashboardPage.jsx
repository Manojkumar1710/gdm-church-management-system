import { useEffect, useState } from 'react';
import api from '../services/api';
import { Skeleton } from '../components/Skeleton';
import { Link } from 'react-router-dom';

const STAT_CONFIG = [
  { key: 'totalEvents',        label: 'Events',           to: '/admin/events',           emoji: '📅' },
  { key: 'totalPhotos',        label: 'Event Photos',     to: '/admin/event-photos',     emoji: '📷' },
  { key: 'totalPastors',       label: 'Pastors',          to: '/admin/pastors',           emoji: '👤' },
  { key: 'totalSermons',       label: 'Sermons',          to: '/admin/sermons',           emoji: '📖' },
  { key: 'totalYoutubeVideos', label: 'YouTube Videos',   to: '/admin/youtube',           emoji: '▶️' },
  { key: 'totalGalleryItems',  label: 'Gallery Items',    to: '/admin/gallery',           emoji: '🖼️' },
  { key: 'totalOfferings',     label: 'Offerings',        to: '/admin/offerings',         emoji: '💰' },
  { key: 'totalPrayerRequests',label: 'Prayer Requests',  to: '/admin/prayer-requests',   emoji: '🙏' },
  { key: 'totalContactMessages',label:'Messages',         to: '/admin/contact-messages',  emoji: '✉️' },
  { key: 'totalChildren',      label: 'SS Children',      to: '/admin/sunday-school/children', emoji: '👶' },
  { key: 'totalTeachers',      label: 'SS Teachers',      to: '/admin/sunday-school/teachers', emoji: '👩‍🏫' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => setStats(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-church-blue mb-1">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">Overview of your church content</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {STAT_CONFIG.map(({ key, label, to, emoji }) => (
          <Link
            key={key}
            to={to}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow flex flex-col gap-2"
          >
            <span className="text-3xl">{emoji}</span>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <span className="text-3xl font-bold text-church-blue">
                {stats?.[key] ?? 0}
              </span>
            )}
            <span className="text-sm text-gray-500">{label}</span>
          </Link>
        ))}
      </div>

      <div className="mt-10 p-6 bg-church-blue rounded-xl text-white">
        <h2 className="font-semibold text-lg mb-1">Quick Links</h2>
        <div className="flex flex-wrap gap-3 mt-3">
          {[
            ['Add Event', '/admin/events'],
            ['Upload Photos', '/admin/event-photos'],
            ['Add Pastor', '/admin/pastors'],
            ['Add Sermon', '/admin/sermons'],
            ['View Offerings', '/admin/offerings'],
            ['Prayer Requests', '/admin/prayer-requests'],
          ].map(([label, to]) => (
            <Link
              key={to}
              to={to}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
