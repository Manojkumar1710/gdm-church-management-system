import { useEffect, useState } from 'react';
import { sundaySchoolService } from '../services/sundaySchoolService';
import { CardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import SectionHeader from '../components/SectionHeader';
import { AcademicCapIcon } from '@heroicons/react/24/outline';

export default function SundaySchoolPage() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const load = (p = 0) => {
    setLoading(true);
    sundaySchoolService.getPrograms(p, 12)
      .then(r => {
        const d = r.data.data;
        setPrograms(d.content);
        setTotalPages(d.totalPages);
        setPage(p);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => load(0), []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      {/* Hero banner */}
      <div className="bg-church-blue text-white rounded-2xl px-8 py-12 mb-14 text-center">
        <AcademicCapIcon className="h-14 w-14 mx-auto text-church-gold mb-4" />
        <h1 className="text-4xl font-serif font-bold mb-3">Sunday School</h1>
        <p className="text-white/75 text-lg max-w-xl mx-auto">
          Nurturing the next generation in faith, knowledge and character.
        </p>
      </div>

      {/* About section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {[
          { icon: '👶', title: 'Children', desc: 'Age-appropriate Bible lessons and activities for children across all class groups.' },
          { icon: '👩‍🏫', title: 'Teachers', desc: 'Dedicated teachers who invest their time and love into every child.' },
          { icon: '📖', title: 'Programs', desc: 'Special programs, events and celebrations throughout the year.' },
        ].map(item => (
          <div key={item.title} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
            <div className="text-4xl mb-3">{item.icon}</div>
            <h3 className="font-serif font-bold text-church-blue text-lg mb-2">{item.title}</h3>
            <p className="text-gray-500 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Programs */}
      <SectionHeader title="Programs & Events" subtitle="What's happening in Sunday School" />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : programs.length === 0 ? (
        <EmptyState
          icon={AcademicCapIcon}
          title="No programs listed yet"
          message="Sunday School programs will appear here when published."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {programs.map(p => (
              <div key={p.id} className="card overflow-hidden">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-48 bg-church-light flex items-center justify-center text-5xl">
                    🎓
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-serif font-semibold text-church-blue mb-1">{p.title}</h3>
                  {p.programDate && (
                    <p className="text-xs text-gray-500 mb-2">
                      📅 {new Date(p.programDate).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                  )}
                  {p.location && <p className="text-xs text-gray-500 mb-2">📍 {p.location}</p>}
                  {p.description && (
                    <p className="text-sm text-gray-600 line-clamp-3">{p.description}</p>
                  )}
                  {p.videoUrl && (
                    <a
                      href={p.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center text-sm text-church-blue font-medium hover:underline"
                    >
                      ▶ Watch Video
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <button
                onClick={() => load(page - 1)}
                disabled={page === 0}
                className="btn-secondary py-2 px-4 text-sm disabled:opacity-30"
              >← Prev</button>
              <span className="py-2 px-4 text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
              <button
                onClick={() => load(page + 1)}
                disabled={page >= totalPages - 1}
                className="btn-secondary py-2 px-4 text-sm disabled:opacity-30"
              >Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
