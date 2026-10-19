import { useEffect, useState } from 'react';
import { prayerService } from '../services/prayerService';
import AdminTable from './components/AdminTable';
import Pagination from './components/Pagination';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircleIcon, ClockIcon, ArchiveBoxIcon, InboxIcon } from '@heroicons/react/24/outline';

const STATUS_META = {
  NEW:         { pill: 'pill--info',   icon: InboxIcon },
  IN_PROGRESS: { pill: 'pill--warn',   icon: ClockIcon },
  PRAYED:      { pill: 'pill--success',icon: CheckCircleIcon },
  ARCHIVED:    { pill: 'pill--muted',  icon: ArchiveBoxIcon },
};

const STATUS_ORDER = ['NEW', 'IN_PROGRESS', 'PRAYED', 'ARCHIVED'];

export default function AdminPrayerPage() {
  const { t, dateLocale } = useLanguage();
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

  const changeStatus = async (row, status) => {
    if (status === 'PRAYED' && row.email && !row.anonymous) {
      setViewing({ ...row, pendingStatus: 'PRAYED' });
      return;
    }
    await applyStatus(row, status);
  };

  const applyStatus = async (row, status, note = '') => {
    try {
      await prayerService.updateStatus(row.id, status, note);
      toast.success(
        status === 'PRAYED' ? t('admin.toast.prayed') : t('admin.toast.statusUpdated'),
        { duration: 3000 }
      );
      load(page);
      if (viewing?.id === row.id) setViewing(v => ({ ...v, status, pendingStatus: null }));
    } catch {
      toast.error(t('admin.toast.updateFailed'));
    }
  };

  const handleModalStatusChange = async (newStatus) => {
    if (newStatus === 'PRAYED' && viewing.email && !viewing.anonymous) {
      setViewing(v => ({ ...v, pendingStatus: 'PRAYED' }));
      return;
    }
    await applyStatus(viewing, newStatus);
  };

  const confirmPrayed = async () => {
    setNotifying(true);
    try {
      await applyStatus(viewing, 'PRAYED', notifyNote);
      setNotifyNote('');
    } finally {
      setNotifying(false);
    }
  };

  const displayed = filterStatus ? rows.filter(r => r.status === filterStatus) : rows;

  const statusPill = (status) => {
    const m = STATUS_META[status] || STATUS_META.NEW;
    return <span className={`pill ${m.pill}`}>{t(`admin.status.${status}`)}</span>;
  };

  const cols = [
    {
      key: 'name', label: t('admin.col.name'),
      render: r => r.anonymous
        ? <em className="text-gray-400 italic text-xs">{t('admin.status.ANONYMOUS')}</em>
        : <span className="font-medium">{r.name || '—'}</span>,
    },
    {
      key: 'requestText', label: t('admin.col.request'),
      render: r => (
        <span className="line-clamp-2 max-w-xs block text-gray-600 text-sm">
          &ldquo;{r.requestText}&rdquo;
        </span>
      ),
    },
    {
      key: 'createdAt', label: t('admin.col.submitted'),
      render: r => r.createdAt
        ? new Date(r.createdAt).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short' })
        : '—',
    },
    { key: 'status', label: t('admin.col.status'), render: r => statusPill(r.status) },
  ];

  return (
    <div>
      <div className="page-header">
        <p className="page-subtitle">{t('admin.pageDesc.prayerRequests')}</p>
      </div>

      <div className="admin-toolbar flex-wrap">
        <span className="admin-alert admin-alert--info text-xs">
          {t('admin.prayer.private')}
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter('')}
            className={`filter-pill ${!filterStatus ? 'is-active' : ''}`}
          >{t('admin.filter.all')}</button>
          {STATUS_ORDER.map(val => (
            <button
              key={val}
              type="button"
              onClick={() => setFilter(filterStatus === val ? '' : val)}
              className={`filter-pill ${filterStatus === val ? 'is-active' : ''}`}
            >
              {t(`admin.status.${val}`)}
              {rows.filter(r => r.status === val).length > 0 && (
                <span className="ml-1 rounded-full bg-white/70 px-1.5">{rows.filter(r => r.status === val).length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {STATUS_ORDER.map(val => {
          const m = STATUS_META[val];
          const Icon = m.icon;
          const count = rows.filter(r => r.status === val).length;
          return (
            <div key={val} className="stat-card">
              <span className={`stat-card__icon ${m.pill}`}>
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="stat-card__value">{count}</p>
                <p className="stat-card__label">{t(`admin.status.${val}`)}</p>
              </div>
            </div>
          );
        })}
      </div>

      <AdminTable
        columns={cols}
        rows={displayed}
        loading={loading}
        onEdit={row => { setViewing(row); setNotifyNote(''); }}
        actions={row => (
          <select
            aria-label={t('admin.form.updateStatus')}
            value={row.status}
            onChange={e => changeStatus(row, e.target.value)}
            className="inline-select"
          >
            {STATUS_ORDER.map(s => (
              <option key={s} value={s}>{t(`admin.status.${s}`)}</option>
            ))}
          </select>
        )}
        emptyMessage={t('admin.empty.prayer')}
        editLabel={t('common.view')}
      />
      <Pagination page={page} totalPages={totalPages} onPageChange={load} />

      <Modal
        open={!!viewing}
        onClose={() => { setViewing(null); setNotifyNote(''); }}
        title={t('admin.entity.prayerRequest')}
        size="md"
      >
        {viewing && (
          <div className="space-y-5">

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">{t('admin.prayer.from')}</p>
                <p className="font-semibold text-gray-800">
                  {viewing.anonymous ? <em className="text-gray-400 font-normal">{t('admin.status.ANONYMOUS')}</em> : viewing.name || '—'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">{t('admin.col.email')}</p>
                <p className="text-gray-700">
                  {viewing.email
                    ? <a href={`mailto:${viewing.email}`} className="text-church-blue hover:underline">{viewing.email}</a>
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">{t('admin.col.submitted')}</p>
                <p className="text-gray-700">
                  {viewing.createdAt ? new Date(viewing.createdAt).toLocaleString(dateLocale, { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">{t('admin.prayer.currentStatus')}</p>
                {statusPill(viewing.status)}
              </div>
            </div>

            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">{t('admin.prayer.requestLabel')}</p>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-gray-800 leading-relaxed whitespace-pre-line text-sm italic">
                &ldquo;{viewing.requestText}&rdquo;
              </div>
            </div>

            {viewing.pendingStatus === 'PRAYED' ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-green-700 font-semibold">
                  <CheckCircleIcon className="h-5 w-5" />
                  {t('admin.prayer.markPrayed')}
                </div>
                {viewing.email && !viewing.anonymous && (
                  <div>
                    <p className="text-sm text-green-700 mb-2">
                      {t('admin.prayer.emailNote', { email: viewing.email })}
                    </p>
                    <textarea
                      rows={3}
                      className="form-input resize-none text-sm"
                      placeholder={t('admin.prayer.notePlaceholder')}
                      value={notifyNote}
                      onChange={e => setNotifyNote(e.target.value)}
                    />
                  </div>
                )}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setViewing(v => ({ ...v, pendingStatus: null }))}
                    className="btn-secondary btn-sm flex-1"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="button"
                    onClick={confirmPrayed}
                    disabled={notifying}
                    className="btn-primary btn-sm flex-1"
                  >
                    {notifying ? t('admin.action.saving') : t('admin.action.confirmPrayed')}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="form-label">{t('admin.form.updateStatus')}</p>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_ORDER.map(s => {
                    const m = STATUS_META[s];
                    const isActive = viewing.status === s;
                    return (
                      <button
                        type="button"
                        key={s}
                        onClick={() => handleModalStatusChange(s)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                          isActive
                            ? 'border-church-blue bg-church-blue/5 text-church-blue ring-2 ring-church-blue/30'
                            : 'border-church-border text-gray-600 hover:border-church-blue hover:bg-church-light'
                        }`}
                      >
                        <m.icon className="h-4 w-4 shrink-0" />
                        {t(`admin.status.${s}`)}
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
