import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { pastorService } from '../services/pastorService';
import { PastorCardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import SectionHeader from '../components/SectionHeader';
import Reveal from '../components/motion/Reveal';
import { StaggerItem } from '../components/motion/Stagger';
import { UserGroupIcon, MapPinIcon, PhoneIcon, CalendarIcon } from '@heroicons/react/24/outline';
import CrossDivider from '../components/ornaments/CrossDivider';
import { useLanguage } from '../context/LanguageContext';

/* ── Pastor card ─────────────────────────────────────────────── */
function PastorCard({ p, t }) {
  return (
    <div className="card p-6 text-center flex flex-col items-center max-w-sm w-full">
      {p.photoUrl ? (
        <img
          src={p.photoUrl}
          alt={p.name}
          className="w-32 h-32 rounded-full object-cover mb-5 avatar-glow"
          loading="lazy"
          width={128}
          height={128}
        />
      ) : (
        <div
          className="w-32 h-32 rounded-full bg-church-blue flex items-center justify-center
                     text-white text-4xl font-bold mb-5 avatar-glow select-none"
          aria-hidden="true"
        >
          {p.name.charAt(0)}
        </div>
      )}

      <span className="text-church-gold text-xs font-semibold uppercase tracking-widest mb-1">
        {t('pastors.pastor')}
      </span>

      <h3
        className="text-lg font-bold text-church-blue leading-tight mb-2"
        style={{ fontFamily: 'Lora, Georgia, serif' }}
      >
        {p.name}
      </h3>

      {p.village && (
        <p className="flex items-center justify-center gap-1 text-sm text-gray-500 mb-3">
          <MapPinIcon className="h-3.5 w-3.5 text-church-gold shrink-0" />
          {p.village}
        </p>
      )}

      {p.bio && (
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-4">
          {p.bio}
        </p>
      )}

      <div className="mt-auto flex flex-wrap justify-center gap-2 pt-2">
        {p.contactPublic && p.contactNumber && (
          <a
            href={`tel:${p.contactNumber}`}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full
                       bg-church-blue/8 border border-church-blue/20 text-church-blue
                       text-xs font-semibold hover:bg-church-blue hover:text-white
                       transition-all duration-300"
          >
            <PhoneIcon className="h-3 w-3" />
            {t('pastors.call')}
          </a>
        )}

        <Link
          to="/schedule"
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full
                     bg-church-gold/10 border border-church-gold/25 text-church-gold
                     text-xs font-semibold hover:bg-church-gold hover:text-white
                     transition-all duration-300"
        >
          <CalendarIcon className="h-3 w-3" />
          {t('pastors.viewSchedule')}
        </Link>
      </div>
    </div>
  );
}

/* ── Formatted time (HH:mm → h:mm AM/PM) ────────────────────── */
function fmtTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12  = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

/* ── Main page ───────────────────────────────────────────────── */
export default function PastorsPage() {
  const { t, dateLocale } = useLanguage();
  const [pastors,  setPastors]  = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading,  setLoading]  = useState(true);

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

      {/* ── Pastors grid ── */}
      <Reveal>
        <SectionHeader
          title={t('pastors.title')}
          subtitle={t('pastors.subtitle')}
        />
        <CrossDivider className="mb-4 mt-2" opacity={0.3} />
      </Reveal>

      {loading ? (
        <div className="flex flex-wrap justify-center gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-full sm:w-72">
              <PastorCardSkeleton />
            </div>
          ))}
        </div>
      ) : pastors.length === 0 ? (
        <EmptyState
          icon={UserGroupIcon}
          title={t('pastors.noPastors')}
          message={t('pastors.pastorsHere')}
        />
      ) : (
        <div className="flex flex-wrap justify-center gap-6">
          {pastors.map((p) => (
            <StaggerItem
              key={p.id}
              className="w-full sm:w-80"
            >
              <PastorCard p={p} t={t} />
            </StaggerItem>
          ))}
        </div>
      )}

      {/* ── Service Schedule ── */}
      {schedule.length > 0 && (
        <div className="mt-20">
          <Reveal>
            <SectionHeader
              title={t('pastors.serviceSchedule')}
              subtitle={t('pastors.scheduleSubtitle')}
            />
          </Reveal>

          {/* Desktop table */}
          <Reveal delay={0.05}>
            <div className="hidden md:block overflow-x-auto rounded-2xl shadow-card border border-church-border">
              <table className="w-full bg-white text-sm">
                <thead>
                  <tr className="bg-church-blue text-white">
                    <th className="text-left px-5 py-3.5 font-semibold">{t('pastors.date')}</th>
                    <th className="text-left px-5 py-3.5 font-semibold">{t('pastors.service')}</th>
                    <th className="text-left px-5 py-3.5 font-semibold">{t('nav.pastors')}</th>
                    <th className="text-left px-5 py-3.5 font-semibold">{t('pastors.village')}</th>
                    <th className="text-left px-5 py-3.5 font-semibold">{t('pastors.time')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-church-border">
                  {schedule.map(s => (
                    <tr key={s.id} className="hover:bg-church-cream transition-colors duration-150">
                      <td className="px-5 py-3.5 font-medium text-gray-800">
                        {new Date(s.serviceDate + 'T00:00:00').toLocaleDateString(dateLocale, {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">{s.serviceType || t('pastors.sundayService')}</td>
                      <td className="px-5 py-3.5 font-semibold text-church-blue">{s.pastorName}</td>
                      <td className="px-5 py-3.5 text-gray-500">
                        {s.pastorVillage && (
                          <span className="flex items-center gap-1">
                            <MapPinIcon className="h-3.5 w-3.5 text-church-gold shrink-0" />
                            {s.pastorVillage}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">
                        {fmtTime(s.startTime)}
                        {s.endTime ? ` – ${fmtTime(s.endTime)}` : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile stacked cards */}
            <div className="md:hidden space-y-3">
              {schedule.map(s => (
                <div
                  key={s.id}
                  className="card p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-church-blue text-sm">
                      {new Date(s.serviceDate + 'T00:00:00').toLocaleDateString(dateLocale, {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </span>
                    <span className="badge bg-church-blue/10 text-church-blue text-xs">
                      {s.serviceType || t('pastors.sundayService')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-700 font-medium">
                    <UserGroupIcon className="h-4 w-4 text-church-gold shrink-0" />
                    {s.pastorName}
                  </div>
                  {s.pastorVillage && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPinIcon className="h-3.5 w-3.5 text-church-gold shrink-0" />
                      {s.pastorVillage}
                    </div>
                  )}
                  {(s.startTime || s.endTime) && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <CalendarIcon className="h-3.5 w-3.5 text-church-gold shrink-0" />
                      {fmtTime(s.startTime)}{s.endTime ? ` – ${fmtTime(s.endTime)}` : ''}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      )}
    </div>
  );
}
