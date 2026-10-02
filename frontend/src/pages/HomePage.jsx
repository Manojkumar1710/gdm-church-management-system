import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { churchService } from '../services/churchService';
import { eventService } from '../services/eventService';
import { sermonService, youtubeService } from '../services/sermonService';
import { pastorService } from '../services/pastorService';
import { CardSkeleton } from '../components/Skeleton';
import SectionHeader from '../components/SectionHeader';
import { getYoutubeId, getYoutubeThumbnail } from '../utils/youtube';
import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';

/* ── Hero ──────────────────────────────────────────────────────── */
function HeroSection({ hero }) {
  const hasBg = hero?.backgroundImageUrl;
  return (
    <section
      className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
      style={hasBg
        ? { backgroundImage: `url(${hero.backgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 60%, #0d1e31 100%)' }
      }
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Decorative cross watermark */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 text-white/5 text-[20rem] font-bold select-none pointer-events-none leading-none hidden xl:block"
           style={{ fontFamily: 'serif' }}>✝</div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs text-white/80 font-medium mb-6 backdrop-blur-sm">
          <span className="text-church-gold">✝</span>
          Welcome to GDM Church
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-5 leading-tight"
            style={{ fontFamily: 'Lora, Georgia, serif' }}>
          {hero?.title || 'Grace, Devotion\nand Mercy'}
        </h1>

        {(hero?.subtitle) && (
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
            {hero.subtitle}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            to={hero?.primaryCtaUrl || '/events'}
            className="btn-gold px-8 py-3 text-base rounded-xl shadow-lg"
          >
            {hero?.primaryCtaText || '📅 Upcoming Events'}
          </Link>
          <Link
            to={hero?.secondaryCtaUrl || '/sermons'}
            className="px-8 py-3 rounded-xl border-2 border-white/40 text-white text-base font-semibold hover:bg-white/10 hover:border-white transition-all duration-200"
          >
            {hero?.secondaryCtaText || '▶ Watch Sermons'}
          </Link>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-white/5 to-transparent" />
    </section>
  );
}

/* ── Event card ────────────────────────────────────────────────── */
function EventCard({ event }) {
  const dateStr = event.eventDate
    ? new Date(event.eventDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  return (
    <Link to={`/events/${event.id}`} className="card group flex flex-col">
      <div className="relative h-44 bg-church-light overflow-hidden">
        {event.imageUrl
          ? <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          : <div className="w-full h-full flex items-center justify-center">
              <CalendarIcon className="h-12 w-12 text-church-blue/20" />
            </div>
        }
        <div className="absolute top-3 left-3">
          <span className="bg-church-blue text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
            {dateStr}
          </span>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-church-blue transition-colors">{event.title}</h3>
        {event.location && (
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-auto pt-2">
            <MapPinIcon className="h-3 w-3 shrink-0" /> {event.location}
          </p>
        )}
      </div>
    </Link>
  );
}

/* ── Photo grid ────────────────────────────────────────────────── */
function PhotoGrid({ photos }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
      {photos.map(p => (
        <div key={p.id} className="aspect-square overflow-hidden rounded-xl bg-church-light group cursor-pointer">
          <img
            src={p.imageUrl}
            alt={p.title || 'Church photo'}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}

/* ── Sermon card ───────────────────────────────────────────────── */
function SermonCard({ sermon }) {
  const ytId = getYoutubeId(sermon.videoUrl);
  const thumb = sermon.thumbnailUrl || getYoutubeThumbnail(sermon.videoUrl);

  return (
    <Link to="/sermons" className="card group flex flex-col overflow-hidden">
      <div className="relative h-44 bg-church-blue/10 overflow-hidden">
        {thumb
          ? <img src={thumb} alt={sermon.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy"
                 onError={e => { e.currentTarget.style.display = 'none'; }} />
          : <div className="w-full h-full flex items-center justify-center bg-church-blue text-white text-5xl">📖</div>
        }
        {ytId && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center group-hover:bg-church-gold transition-colors duration-200">
              <span className="text-white text-lg ml-0.5">▶</span>
            </div>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-church-blue transition-colors">{sermon.title}</h3>
        <p className="text-xs text-gray-500 mt-1.5">{[sermon.speaker, sermon.sermonDate].filter(Boolean).join(' · ')}</p>
      </div>
    </Link>
  );
}

/* ── Main page ─────────────────────────────────────────────────── */
export default function HomePage() {
  const [hero,     setHero]     = useState(null);
  const [events,   setEvents]   = useState([]);
  const [photos,   setPhotos]   = useState([]);
  const [sermons,  setSermons]  = useState([]);
  const [pastors,  setPastors]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.allSettled([
      churchService.getHero(),
      eventService.getUpcoming(),
      eventService.getLatestPhotos(15),
      sermonService.list(0, 3),
      pastorService.list(),
    ]).then(([heroRes, eventsRes, photosRes, sermonsRes, pastorsRes]) => {
      if (heroRes.status    === 'fulfilled') setHero(heroRes.value.data.data);
      if (eventsRes.status  === 'fulfilled') setEvents(eventsRes.value.data.data?.slice(0, 4)           || []);
      if (photosRes.status  === 'fulfilled') setPhotos(photosRes.value.data.data                         || []);
      if (sermonsRes.status === 'fulfilled') setSermons(sermonsRes.value.data.data?.content?.slice(0, 3) || []);
      if (pastorsRes.status === 'fulfilled') setPastors(pastorsRes.value.data.data?.slice(0, 3)          || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <HeroSection hero={hero} />

      {/* ── Upcoming Events ─────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Upcoming Events" subtitle="Come together in worship, fellowship and community" />
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => <CardSkeleton key={i} />)}
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {events.map(e => <EventCard key={e.id} event={e} />)}
            </div>
          ) : (
            <div className="text-center py-14">
              <p className="text-gray-400 text-lg">No upcoming events at this time.</p>
              <p className="text-gray-300 text-sm mt-1">Check back soon!</p>
            </div>
          )}
          <div className="text-center mt-10">
            <Link to="/events" className="btn-secondary">View All Events →</Link>
          </div>
        </div>
      </section>

      {/* ── Latest Event Photos ──────────────────── */}
      {(loading || photos.length > 0) && (
        <section className="py-20 bg-church-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader title="Latest Event Photos" subtitle="Moments of worship, celebration and community" />
            {loading ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-xl bg-gray-200 animate-pulse" />
                ))}
              </div>
            ) : (
              <PhotoGrid photos={photos} />
            )}
            <div className="text-center mt-10">
              <Link to="/photos" className="btn-primary">See All Photos →</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Latest Sermons / YouTube ─────────────── */}
      {(loading || sermons.length > 0) && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader title="Latest Sermons" subtitle="Be inspired, encouraged and equipped through the Word" />
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[1,2,3].map(i => <CardSkeleton key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {sermons.map(s => <SermonCard key={s.id} sermon={s} />)}
              </div>
            )}
            <div className="text-center mt-10">
              <Link to="/sermons" className="btn-secondary">All Sermons →</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Pastors preview ──────────────────────── */}
      {pastors.length > 0 && (
        <section className="py-20 bg-church-blue">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="section-header">
              <h2 className="text-white">Our Pastors</h2>
              <p className="text-white/60">Shepherds dedicated to serving our congregation</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {pastors.map(p => (
                <div key={p.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors">
                  {p.photoUrl
                    ? <img src={p.photoUrl} alt={p.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-white/20" loading="lazy" />
                    : <div className="w-24 h-24 rounded-full bg-church-gold/20 border-4 border-church-gold/30 flex items-center justify-center text-church-gold text-3xl font-bold mx-auto mb-4">
                        {p.name.charAt(0)}
                      </div>
                  }
                  <h3 className="font-semibold text-white text-base">{p.name}</h3>
                  {p.village && <p className="text-white/50 text-sm mt-0.5">📍 {p.village}</p>}
                  {p.contactPublic && p.contactNumber && (
                    <p className="text-white/50 text-xs mt-1">📞 {p.contactNumber}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/pastors" className="px-8 py-3 rounded-xl border-2 border-white/30 text-white font-semibold text-sm hover:bg-white/10 hover:border-white transition-all duration-200">
                Meet All Pastors →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Prayer + Offering CTA ────────────────── */}
      <section className="py-20 bg-church-cream">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="text-5xl mb-4">🙏</div>
          <h2 className="text-3xl md:text-4xl font-bold text-church-blue mb-4"
              style={{ fontFamily: 'Lora, Georgia, serif' }}>
            How Can We Serve You?
          </h2>
          <p className="text-gray-500 text-lg mb-8 leading-relaxed">
            We're here to pray with you, support your journey, and welcome you into our community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/prayer"    className="btn-gold px-8 py-3 rounded-xl text-base shadow-md">Submit a Prayer Request</Link>
            <Link to="/offerings" className="btn-secondary px-8 py-3 rounded-xl text-base">💛 Give an Offering</Link>
          </div>
        </div>
      </section>

      {/* ── Contact CTA ──────────────────────────── */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-church-blue mb-3"
              style={{ fontFamily: 'Lora, Georgia, serif' }}>
            Get in Touch
          </h2>
          <p className="text-gray-500 mb-6">We'd love to hear from you — questions, prayer needs or just to say hello.</p>
          <Link to="/contact" className="btn-primary px-8 py-3 rounded-xl">Contact Us →</Link>
        </div>
      </section>
    </div>
  );
}
