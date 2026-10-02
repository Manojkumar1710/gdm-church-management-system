import { useEffect, useState } from 'react';
import { offeringService } from '../services/offeringService';
import AdminTable from './components/AdminTable';
import Pagination from './components/Pagination';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  SUCCESS: 'bg-green-100 text-green-700',
  FAILED:  'bg-red-100 text-red-600',
};

const EMPTY = { donorName: '', email: '', amount: '', purposeId: '', offeringDate: '', paymentMethod: '', paymentReference: '', status: 'SUCCESS', anonymous: false, notes: '' };

export default function AdminOfferingsPage() {
  const [rows, setRows] = useState([]);
  const [purposes, setPurposes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

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
    if (!form.amount || Number(form.amount) < 1) e.amount = 'Amount must be ≥ 1';
    if (!form.offeringDate) e.offeringDate = 'Date is required';
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
      toast.success('Offering recorded');
      setModal(false); setForm(EMPTY); load(page);
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const changeStatus = async (row, status) => {
    try {
      await offeringService.updateStatus(row.id, status);
      toast.success('Status updated');
      load(page);
    } catch { toast.error('Update failed'); }
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  const cols = [
    { key: 'donorName', label: 'Donor' },
    { key: 'amount', label: 'Amount', render: r => `₹ ${Number(r.amount).toLocaleString('en-IN')}` },
    { key: 'purposeName', label: 'Purpose' },
    { key: 'offeringDate', label: 'Date' },
    { key: 'paymentMethod', label: 'Method' },
    { key: 'status', label: 'Status', render: r => <span className={`badge ${STATUS_COLORS[r.status] || 'bg-gray-100'}`}>{r.status}</span> },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-church-blue">Offerings</h1>
          <p className="text-gray-500 text-sm">Offering records — admin only, never public</p>
        </div>
        <button onClick={() => { setForm(EMPTY); setErrors({}); setModal(true); }} className="btn-primary text-sm py-2 px-4">
          + Record Offering
        </button>
      </div>

      <AdminTable
        columns={cols} rows={rows} loading={loading}
        actions={row => (
          <select
            value={row.status}
            onChange={e => changeStatus(row, e.target.value)}
            className="text-xs border border-gray-200 rounded px-2 py-1"
          >
            {['PENDING', 'SUCCESS', 'FAILED'].map(s => <option key={s}>{s}</option>)}
          </select>
        )}
      />
      <Pagination page={page} totalPages={totalPages} onPageChange={load} />

      <Modal open={modal} onClose={() => setModal(false)} title="Record Offering" size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 md:col-span-2">
              <input type="checkbox" id="oanon" className="rounded" checked={form.anonymous}
                onChange={e => setForm(p => ({ ...p, anonymous: e.target.checked }))} />
              <label htmlFor="oanon" className="text-sm text-gray-700">Anonymous offering</label>
            </div>
            {!form.anonymous && (
              <>
                <div>
                  <label className="form-label">Donor Name</label>
                  <input className="form-input" {...f('donorName')} />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" {...f('email')} />
                </div>
              </>
            )}
            <div>
              <label className="form-label">Amount (₹) *</label>
              <input type="number" min="1" className={`form-input ${errors.amount ? 'border-red-400' : ''}`} {...f('amount')} />
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
            </div>
            <div>
              <label className="form-label">Offering Date *</label>
              <input type="date" className={`form-input ${errors.offeringDate ? 'border-red-400' : ''}`} {...f('offeringDate')} />
              {errors.offeringDate && <p className="text-red-500 text-xs mt-1">{errors.offeringDate}</p>}
            </div>
            <div>
              <label className="form-label">Purpose</label>
              <select className="form-input" {...f('purposeId')}>
                <option value="">Select purpose…</option>
                {purposes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Payment Method</label>
              <select className="form-input" {...f('paymentMethod')}>
                <option value="">Select…</option>
                {['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Other'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Payment Reference</label>
              <input className="form-input" {...f('paymentReference')} placeholder="Transaction ID, cheque no…" />
            </div>
            <div>
              <label className="form-label">Status</label>
              <select className="form-input" {...f('status')}>
                {['PENDING', 'SUCCESS', 'FAILED'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="form-label">Notes</label>
              <textarea rows={2} className="form-input resize-none" {...f('notes')} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary py-2 px-4 text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary py-2 px-4 text-sm">
              {saving ? 'Saving…' : 'Record Offering'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
