import { useEffect, useState } from 'react';
import { offeringService } from '../services/offeringService';
import AdminTable from './components/AdminTable';
import Pagination from './components/Pagination';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';

const STATUS_PILL = {
  PENDING: 'pill--warn',
  SUCCESS: 'pill--success',
  FAILED:  'pill--danger',
};

const STATUSES = ['PENDING', 'SUCCESS', 'FAILED'];

const EMPTY = { donorName: '', email: '', amount: '', purposeId: '', offeringDate: '', paymentMethod: '', paymentReference: '', status: 'SUCCESS', anonymous: false, notes: '' };

export default function AdminOfferingsPage() {
  const { t } = useLanguage();
  const [rows, setRows] = useState([]);
  const [purposes, setPurposes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const entity = t('admin.entity.offering');

  const load = (p = 0) => {
    setLoading(true);
    offeringService.adminList(p, 20)
      .then(r => { const d = r.data.data; setRows(d.content); setTotalPages(d.totalPages); setPage(p); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    offeringService.getPurposes().then(r => setPurposes(r.data.data || []));
    load(0);
  }, []);

  const validate = () => {
    const e = {};
    if (!form.amount || Number(form.amount) < 1) e.amount = t('admin.validate.amountMin');
    if (!form.offeringDate) e.offeringDate = t('admin.validate.dateRequired');
    setErrors(e); return Object.keys(e).length === 0;
  };

  const save = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await offeringService.adminCreate({
        ...form,
        amount: Number(form.amount),
        purposeId: form.purposeId ? Number(form.purposeId) : null,
      });
      toast.success(t('admin.toast.created', { entity }));
      setModal(false); setForm(EMPTY); load(page);
    } catch (err) { toast.error(err.response?.data?.message || t('admin.toast.saveFailed')); }
    finally { setSaving(false); }
  };

  const changeStatus = async (row, status) => {
    try {
      await offeringService.updateStatus(row.id, status);
      toast.success(t('admin.toast.statusUpdated'));
      load(page);
    } catch { toast.error(t('admin.toast.updateFailed')); }
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  const cols = [
    { key: 'donorName', label: t('admin.col.donor'), render: r => r.anonymous ? <em className="text-gray-400">{t('admin.status.ANONYMOUS')}</em> : (r.donorName || '—') },
    { key: 'amount', label: t('admin.col.amount'), render: r => `₹ ${Number(r.amount).toLocaleString('en-IN')}` },
    { key: 'purposeName', label: t('admin.col.purpose') },
    { key: 'offeringDate', label: t('admin.col.date') },
    { key: 'paymentMethod', label: t('admin.col.method') },
    { key: 'status', label: t('admin.col.status'), render: r => (
      <span className={`pill ${STATUS_PILL[r.status] || 'pill--muted'}`}>{t(`admin.status.${r.status}`)}</span>
    ) },
  ];

  return (
    <div>
      <div className="page-header">
        <p className="page-subtitle">{t('admin.pageDesc.offerings')}</p>
        <button onClick={() => { setForm(EMPTY); setErrors({}); setModal(true); }} className="btn-primary btn-sm">
          + {t('admin.action.record', { entity })}
        </button>
      </div>

      <AdminTable
        columns={cols} rows={rows} loading={loading}
        actions={row => (
          <select
            value={row.status}
            onChange={e => changeStatus(row, e.target.value)}
            className="inline-select"
            aria-label={`${t('admin.form.updateStatus')} — ${row.donorName || ''}`}
          >
            {STATUSES.map(s => <option key={s} value={s}>{t(`admin.status.${s}`)}</option>)}
          </select>
        )}
        emptyMessage={t('admin.empty.offerings')}
      />
      <Pagination page={page} totalPages={totalPages} onPageChange={load} />

      <Modal open={modal} onClose={() => setModal(false)} title={t('admin.action.record', { entity })} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 md:col-span-2">
              <input type="checkbox" id="oanon" className="rounded" checked={form.anonymous}
                onChange={e => setForm(p => ({ ...p, anonymous: e.target.checked }))} />
              <label htmlFor="oanon" className="text-sm text-gray-700">{t('admin.form.anonymous')}</label>
            </div>
            {!form.anonymous && (
              <>
                <div>
                  <label className="form-label" htmlFor="o-donor">{t('admin.form.donorName')}</label>
                  <input id="o-donor" className="form-input" {...f('donorName')} />
                </div>
                <div>
                  <label className="form-label" htmlFor="o-email">{t('admin.form.email')}</label>
                  <input id="o-email" type="email" className="form-input" {...f('email')} />
                </div>
              </>
            )}
            <div>
              <label className="form-label" htmlFor="o-amount">{t('admin.form.amount')} *</label>
              <input id="o-amount" type="number" min="1" className={`form-input ${errors.amount ? 'border-red-400' : ''}`} {...f('amount')} />
              {errors.amount && <p className="form-error">{errors.amount}</p>}
            </div>
            <div>
              <label className="form-label" htmlFor="o-date">{t('admin.form.date')} *</label>
              <input id="o-date" type="date" className={`form-input ${errors.offeringDate ? 'border-red-400' : ''}`} {...f('offeringDate')} />
              {errors.offeringDate && <p className="form-error">{errors.offeringDate}</p>}
            </div>
            <div>
              <label className="form-label" htmlFor="o-purpose">{t('admin.form.purpose')}</label>
              <select id="o-purpose" className="form-input" {...f('purposeId')}>
                <option value="">{t('admin.form.selectPlaceholder')}</option>
                {purposes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label" htmlFor="o-method">{t('admin.form.paymentMethod')}</label>
              <select id="o-method" className="form-input" {...f('paymentMethod')}>
                <option value="">{t('admin.form.selectPlaceholder')}</option>
                {['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Other'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label" htmlFor="o-ref">{t('admin.form.paymentReference')}</label>
              <input id="o-ref" className="form-input" {...f('paymentReference')} placeholder="Transaction ID / cheque no." />
            </div>
            <div>
              <label className="form-label" htmlFor="o-status">{t('admin.form.status')}</label>
              <select id="o-status" className="form-input" {...f('status')}>
                {STATUSES.map(s => <option key={s} value={s}>{t(`admin.status.${s}`)}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="form-label" htmlFor="o-notes">{t('admin.form.notes')}</label>
              <textarea id="o-notes" rows={2} className="form-input resize-none" {...f('notes')} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary btn-sm">{t('common.cancel')}</button>
            <button type="submit" disabled={saving} className="btn-primary btn-sm">
              {saving ? t('admin.action.saving') : t('admin.action.record', { entity })}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
