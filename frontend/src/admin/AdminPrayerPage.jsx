import { useEffect, useState } from 'react';
import { prayerService } from '../services/prayerService';
import AdminTable from './components/AdminTable';
import Pagination from './components/Pagination';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { HandRaisedIcon, CheckCircleIcon, ClockIcon, ArchiveBoxIcon, InboxIcon } from '@heroicons/react/24/outline';

const STATUS_META = {
  NEW:         { color: 'bg-blue-100 text-blue-700',   icon: InboxIcon,        label: 'New' },
  IN_PROGRESS: { color: 'bg-amber-100 text-amber-700', icon: ClockIcon,        label: 'In Progress' },
  PRAYED:      { color: 'bg-green-100 text-green-700', icon: CheckCircleIcon,  label: 'Prayed ✓' },
  ARCHIVED:    { color: 'bg-gray-100 text-gray-500',   icon: ArchiveBoxIcon,   label: 'Archived' },
};

const STATUS_OPTIONS = [
  { value: 'NEW',         label: '📥 New' },
  { value: 'IN_PROGRESS', label: '🕐 In Progress' },
  { value: 'PRAYED',      label: '✅ Prayed' },
  { value: 'ARCHIVED',    label: '📦 Archived' },
];

export default function AdminPrayerPage() {
  const [rows, setRows]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [viewing, setViewing]     = useState(null);
  const [filterStatus, setFilter] = useState('');
  const [notifyNote, setNotifyNote] = useState('');
  const [notifying, setNotifying]   = useState(false);

  const load = (p = 0) => {
    setLoading(true);
    prayerService.adminList(p, 20)
      .then(r => {
        const d = r.data.data;
        setRows(d.content);
        setTotalPages(d.totalPages);
        setPage(p);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => load(0), []);

  /* Change status inline (table dropdown) */
  const changeStatus = async (row, status) => {
    // If marking as PRAYED and request has an email, open the notify dialog
    if (status === 'PRAYED' && row.email && !row.anonymous) {
      setViewing({ ...row, pendingStatus: 'PRAYED' });
      return;
    }
    await applyStatus(row, status);
  };

  /* Actually save the status change */
  const applyStatus = async (row, status, note = '') => {
    try {
      await prayerService.updateStatus(row.id, status, note);
      toast.success(
        status === 'PRAYED'
          ? '🙏 Marked as Prayed'
          : 'Status updated',
        { duration: 3000 }
      );
      load(page);
      if (viewing?.id === row.id) setViewing(v => ({ ...v, status, pendingStatus: null }));
    } catch {
      toast.error('Update failed');
    }
  };

  /* From the detail modal */
  const handleModalStatusChange = async (newStatus) => {
    if (newStatus === 'PRAYED' && viewing.email && !viewing.anonymous) {
      setViewing(v => ({ ...v, pendingStatus: 'PRAYED' }));
      return;
    }
    await applyStatus(viewing, newStatus);
  };

  /* Confirm "mark as prayed" with optional pastoral note */
  const confirmPrayed = async () => {
    setNotifying(true);
    try {
      await applyStatus(viewing, 'PRAYED', notifyNote);
      setNotifyNote('');
    } finally {
      setNotifying(false);
    }
  };

  /* Filtered rows */
  const displayed = filterStatus ? rows.filter(r => r.status === filterStatus) : rows;

  const cols = [
    {
      key: 'name', label: 'Name',
      render: r => r.anonymous
        ? <em className="text-gray-400 italic text-xs">Anonymous</em>
        : <span className="font-medium">{r.name || '—'}</span>,
    },
    {
      key: 'requestText', label: 'Request',
      render: r => (
        <span className="line-clamp-2 max-w-xs block text-gray-600 text-sm">
          &ldquo;{r.requestText}&rdquo;
        </span>
      ),
    },
    {
      key: 'createdAt', label: 'Submitted',
      render: r => r.createdAt
        ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
        : '—',
    },
    {
      key: 'status', label: 'Status',
      render: r => {
        const m = STATUS_META[r.status] || STATUS_META.NEW;
        return <span className={`badge ${m.color}`}>{m.label}</span>;
      },
    },
  ];

  /* ── render ── */
  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-serif font-bold text-church-blue flex items-center gap-2">
            <HandRaisedIcon className="h-6 w-6" /> Prayer Requests
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Private — visible to admins only</p>
        </div>

        {/* Status filter pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('')}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              !filterStatus ? 'bg-church-blue text-white border-church-blue' : 'border-gray-300 text-gray-500 hover:border-church-blue'
            }`}
          >All</button>
          {Object.entries(STATUS_META).map(([val, { color, label }]) => (
            <button
              key={val}
              onClick={() => setFilter(filterStatus === val ? '' : val)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                filterStatus === val ? 'ring-2 ring-church-blue ' + color : 'border-gray-200 text-gray-500 hover:border-gray-400'
              }`}
            >
              {label} {rows.filter(r => r.status === val).length > 0 && (
                <span className="ml-1 bg-white/60 rounded-full px-1">{rows.filter(r => r.status === val).length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {Object.entries(STATUS_META).map(([val, { color, label, icon: Icon }]) => {
          const count = rows.filter(r => r.status === val).length;
          return (
            <div key={val} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <span className={`p-2 rounded-lg ${color}`}>
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-2xl font-bold text-gray-800">{count}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <AdminTable
        columns={cols}
        rows={displayed}
        loading={loading}
        onEdit={row => { setViewing(row); setNotifyNote(''); }}
        actions={row => (
          <select
            value={row.status}
            onChange={e => changeStatus(row, e.target.value)}
            className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-church-blue"
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        )}
        emptyMessage="No prayer requests found."
      />
      <Pagination page={page} totalPages={totalPages} onPageChange={load} />

      {/* ── Detail / Prayed modal ── */}
      <Modal
        open={!!viewing}
        onClose={() => { setViewing(null); setNotifyNote(''); }}
        title="Prayer Request"
        size="md"
      >
        {viewing && (
          <div className="space-y-5">

            {/* Requester info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">From</p>
                <p className="font-semibold text-gray-800">
                  {viewing.anonymous ? <em className="text-gray-400 font-normal">Anonymous</em> : viewing.name || '—'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Email</p>
                <p className="text-gray-700">
                  {viewing.email
                    ? <a href={`mailto:${viewing.email}`} className="text-church-blue hover:underline">{viewing.email}</a>
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Submitted</p>
                <p className="text-gray-700">
                  {viewing.createdAt ? new Date(viewing.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Current Status</p>
                {(() => {
                  const m = STATUS_META[viewing.status] || STATUS_META.NEW;
                  return <span className={`badge ${m.color}`}>{m.label}</span>;
                })()}
              </div>
            </div>

            {/* Prayer text */}
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Prayer Request</p>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-gray-800 leading-relaxed whitespace-pre-line text-sm italic">
                &ldquo;{viewing.requestText}&rdquo;
              </div>
            </div>

            {/* ── PRAYED confirmation panel ── */}
            {viewing.pendingStatus === 'PRAYED' ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-green-700 font-semibold">
                  <CheckCircleIcon className="h-5 w-5" />
                  Mark this request as Prayed
                </div>
                {viewing.email && !viewing.anonymous && (
                  <div>
                    <p className="text-sm text-green-700 mb-2">
                      This person has an email (<strong>{viewing.email}</strong>).
                      You can add a personal note to be stored with this prayer record.
                    </p>
                    <textarea
                      rows={3}
                      className="form-input resize-none text-sm"
                      placeholder="Optional pastoral note (stored privately, not emailed automatically)…"
                      value={notifyNote}
                      onChange={e => setNotifyNote(e.target.value)}
                    />
                  </div>
                )}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setViewing(v => ({ ...v, pendingStatus: null }))}
                    className="btn-secondary py-2 px-4 text-sm flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmPrayed}
                    disabled={notifying}
                    className="btn-primary py-2 px-4 text-sm flex-1 bg-green-600 hover:bg-green-700 focus:ring-green-500"
                  >
                    {notifying ? 'Saving…' : '🙏 Confirm Prayed'}
                  </button>
                </div>
              </div>
            ) : (
              /* Normal status update */
              <div>
                <label className="form-label">Update Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_OPTIONS.map(s => {
                    const m = STATUS_META[s.value];
                    const isActive = viewing.status === s.value;
                    return (
                      <button
                        key={s.value}
                        onClick={() => handleModalStatusChange(s.value)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                          isActive
                            ? `${m.color} border-transparent ring-2 ring-offset-1 ring-church-blue`
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <m.icon className="h-4 w-4 shrink-0" />
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
