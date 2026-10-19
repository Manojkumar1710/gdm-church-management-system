import { useEffect, useState } from 'react';
import { contactService } from '../services/prayerService';
import AdminTable from './components/AdminTable';
import Pagination from './components/Pagination';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';

const STATUS_PILL = {
  NEW:      'pill--info',
  READ:     'pill--warn',
  RESOLVED: 'pill--success',
};

const STATUSES = ['NEW', 'READ', 'RESOLVED'];

export default function AdminContactPage() {
  const { t, lang } = useLanguage();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [viewing, setViewing] = useState(null);

  const load = (p = 0) => {
    setLoading(true);
    contactService.adminList(p, 20)
      .then(r => { const d = r.data.data; setRows(d.content); setTotalPages(d.totalPages); setPage(p); })
      .finally(() => setLoading(false));
  };

  useEffect(() => load(0), []);

  const statusPill = (status) => (
    <span className={`pill ${STATUS_PILL[status] || 'pill--muted'}`}>
      {t(`admin.status.${status}`)}
    </span>
  );

  const changeStatus = async (row, status) => {
    try {
      await contactService.updateStatus(row.id, status);
      toast.success(t('admin.toast.statusUpdated'));
      load(page);
      if (viewing?.id === row.id) setViewing(v => ({ ...v, status }));
    } catch { toast.error(t('admin.toast.updateFailed')); }
  };

  const fmtDate = (value, withTime = false) => {
    if (!value) return '—';
    const d = new Date(value);
    return withTime
      ? d.toLocaleString(lang === 'te' ? 'te-IN' : 'en-IN', { dateStyle: 'medium', timeStyle: 'short' })
      : d.toLocaleDateString(lang === 'te' ? 'te-IN' : 'en-IN');
  };

  const cols = [
    { key: 'name', label: t('admin.col.name') },
    { key: 'email', label: t('admin.col.email') },
    { key: 'subject', label: t('admin.col.subject') },
    { key: 'createdAt', label: t('admin.col.received'), render: r => fmtDate(r.createdAt) },
    { key: 'status', label: t('admin.col.status'), render: r => statusPill(r.status) },
  ];

  return (
    <div>
      <div className="page-header">
        <p className="page-subtitle">{t('admin.pageDesc.messages')}</p>
      </div>

      <AdminTable
        columns={cols} rows={rows} loading={loading}
        onEdit={setViewing}
        editLabel={t('common.view')}
        actions={row => (
          <select
            value={row.status}
            onChange={e => changeStatus(row, e.target.value)}
            className="inline-select"
            aria-label={`${t('admin.form.updateStatus')} — ${row.name || ''}`}
          >
            {STATUSES.map(s => <option key={s} value={s}>{t(`admin.status.${s}`)}</option>)}
          </select>
        )}
        emptyMessage={t('admin.empty.messages')}
      />
      <Pagination page={page} totalPages={totalPages} onPageChange={load} />

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={t('admin.entity.contactMessage')} size="lg">
        {viewing && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div><p className="form-label">{t('admin.col.name')}</p><p className="font-medium">{viewing.name}</p></div>
              <div><p className="form-label">{t('admin.col.email')}</p><a href={`mailto:${viewing.email}`} className="text-church-blue hover:underline break-all">{viewing.email}</a></div>
              <div><p className="form-label">{t('admin.col.phone')}</p><p>{viewing.phone || '—'}</p></div>
              <div><p className="form-label">{t('admin.col.received')}</p><p>{fmtDate(viewing.createdAt, true)}</p></div>
            </div>
            {viewing.subject && (
              <div><p className="form-label">{t('admin.col.subject')}</p><p className="font-medium">{viewing.subject}</p></div>
            )}
            <div>
              <p className="form-label">{t('admin.col.message')}</p>
              <p className="whitespace-pre-line rounded-2xl border border-church-border bg-church-light p-4 text-sm leading-relaxed text-gray-800">
                {viewing.message}
              </p>
            </div>
            <div>
              <label className="form-label" htmlFor="contact-status">{t('admin.form.updateStatus')}</label>
              <select id="contact-status" value={viewing.status} onChange={e => changeStatus(viewing, e.target.value)} className="form-input">
                {STATUSES.map(s => <option key={s} value={s}>{t(`admin.status.${s}`)}</option>)}
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
