import { useEffect, useState } from 'react';
import api from '../services/api';
import { Skeleton } from '../components/Skeleton';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  CalendarIcon, PhotoIcon, UserGroupIcon, BookOpenIcon, PlayIcon,
  RectangleGroupIcon, BanknotesIcon, HandRaisedIcon, EnvelopeIcon,
  FaceSmileIcon, AcademicCapIcon,
} from '@heroicons/react/24/outline';

const STAT_CONFIG = [
  { key: 'totalEvents',          label: 'stat.events',        to: '/admin/events',                   icon: CalendarIcon },
  { key: 'totalPhotos',          label: 'stat.eventPhotos',   to: '/admin/event-photos',             icon: PhotoIcon },
  { key: 'totalPastors',         label: 'stat.pastors',       to: '/admin/pastors',                  icon: UserGroupIcon },
  { key: 'totalSermons',         label: 'stat.sermons',       to: '/admin/sermons',                  icon: BookOpenIcon },
  { key: 'totalYoutubeVideos',   label: 'stat.youtubeVideos', to: '/admin/youtube',                  icon: PlayIcon },
  { key: 'totalGalleryItems',    label: 'stat.galleryItems',  to: '/admin/gallery',                  icon: RectangleGroupIcon },
  { key: 'totalOfferings',       label: 'stat.offerings',     to: '/admin/offerings',                icon: BanknotesIcon },
  { key: 'totalPrayerRequests',  label: 'stat.prayerRequests',to: '/admin/prayer-requests',          icon: HandRaisedIcon },
  { key: 'totalContactMessages', label: 'stat.messages',      to: '/admin/contact-messages',         icon: EnvelopeIcon },
  { key: 'totalChildren',        label: 'stat.ssChildren',    to: '/admin/sunday-school/children',   icon: FaceSmileIcon },
  { key: 'totalTeachers',        label: 'stat.ssTeachers',    to: '/admin/sunday-school/teachers',   icon: AcademicCapIcon },
];

const QUICK_LINKS = [
  ['quickLink.addEvent',       '/admin/events'],
  ['quickLink.uploadPhotos',   '/admin/event-photos'],
  ['quickLink.addPastor',      '/admin/pastors'],
  ['quickLink.addSermon',      '/admin/sermons'],
  ['quickLink.viewOfferings',  '/admin/offerings'],
  ['quickLink.prayerRequests', '/admin/prayer-requests'],
];

export default function DashboardPage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => setStats(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <p className="page-subtitle">{t('admin.pageDesc.dashboard')}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {STAT_CONFIG.map(({ key, label, to, icon: Icon }) => (
          <Link
            key={key}
            to={to}
            className="stat-card"
          >
            <span className="stat-card__icon">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <span className="stat-card__value">{stats?.[key] ?? 0}</span>
            )}
            <span className="stat-card__label">{t(`admin.${label}`)}</span>
          </Link>
        ))}
      </div>

      <section className="mt-8 overflow-hidden rounded-2xl bg-church-blue p-6 text-white shadow-card">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-church-gold">
          {t('admin.quickLinks')}
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          {QUICK_LINKS.map(([key, to]) => (
            <Link
              key={to}
              to={to}
              className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-church-gold"
            >
              {t(`admin.${key}`)}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
