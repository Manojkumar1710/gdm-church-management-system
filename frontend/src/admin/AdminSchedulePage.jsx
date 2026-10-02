import { useEffect, useState } from 'react';
import { pastorService } from '../services/pastorService';
import AdminTable from './components/AdminTable';
import ConfirmDialog from './components/ConfirmDialog';
import Modal from '../components/Modal';
import TimePicker, { formatTime } from '../components/TimePicker';
import toast from 'react-hot-toast';

const EMPTY = { pastorId: '', serviceDate: '', serviceType: 'Sunday Service', startTime: '', endTime: '', notes: '' };

export default function AdminSchedulePage() {
  const [rows, setRows] = useState([]);
  const [pastors, setPastors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const load = () => {
    setLoading(true);
    // Load all upcoming schedules (no date filter = from today)
    pastorService.getSchedule().then(r => setRows(r.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    pastorService.adminList(0, 100).then(r => setPastors(r.data.data?.content || []));
    load();
  }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setErrors({}); setModal(true); };
  const openEdit = (row) => {
    setEditing(row);
    setForm({ pastorId: row.pastorId || '', serviceDate: row.serviceDate || '',
      serviceType: row.serviceType || 'Sunday Service', startTime: row.startTime || '',
      endTime: row.endTime || '', notes: row.notes || '' });
    setErrors({}); setModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.pastorId) e.pastorId = 'Select a pastor';
    if (!form.serviceDate) e.serviceDate = 'Service date is required';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const save = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form, pastorId: Number(form.pastorId) };
      if (editing) await pastorService.updateSchedule(editing.id, payload);
      else await pastorService.createSchedule(payload);
      toast.success(editing ? 'Schedule updated' : 'Schedule created');
      setModal(false); load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await pastorService.deleteSchedule(deleting.id);
      toast.success('Schedule deleted');
      setDeleting(null); load();
    } catch { toast.error('Delete failed'); } finally { setDeleteLoading(false); }
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  const cols = [
    { key: 'serviceDate', label: 'Date', render: r => r.serviceDate ? new Date(r.serviceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
    { key: 'serviceType', label: 'Service' },
    { key: 'pastorName', label: 'Pastor' },
    { key: 'pastorVillage', label: 'Village' },
    { key: 'startTime', label: 'Start', render: r => formatTime(r.startTime) },
    { key: 'endTime', label: 'End', render: r => formatTime(r.endTime) },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-church-blue">Pastor Schedule</h1>
          <p className="text-gray-500 text-sm">Assign pastors to service dates</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm py-2 px-4">+ Add Schedule</button>
      </div>

      <AdminTable columns={cols} rows={rows} loading={loading} onEdit={openEdit} onDelete={setDeleting} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Schedule' : 'Add Schedule'}>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="form-label">Pastor *</label>
            <select className={`form-input ${errors.pastorId ? 'border-red-400' : ''}`} {...f('pastorId')}>
              <option value="">Select pastor…</option>
              {pastors.map(p => <option key={p.id} value={p.id}>{p.name} — {p.village || 'N/A'}</option>)}
            </select>
            {errors.pastorId && <p className="text-red-500 text-xs mt-1">{errors.pastorId}</p>}
          </div>
          <div>
            <label className="form-label">Service Date *</label>
            <input type="date" className={`form-input ${errors.serviceDate ? 'border-red-400' : ''}`} {...f('serviceDate')} />
            {errors.serviceDate && <p className="text-red-500 text-xs mt-1">{errors.serviceDate}</p>}
          </div>
          <div>
            <label className="form-label">Service Type</label>
            <input className="form-input" {...f('serviceType')} placeholder="Sunday Service, Prayer Meeting…" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TimePicker
              label="Start Time"
              value={form.startTime}
              onChange={v => setForm(p => ({ ...p, startTime: v }))}
            />
            <TimePicker
              label="End Time"
              value={form.endTime}
              onChange={v => setForm(p => ({ ...p, endTime: v }))}
            />
          </div>
          <div>
            <label className="form-label">Notes</label>
            <textarea rows={2} className="form-input resize-none" {...f('notes')} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary py-2 px-4 text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary py-2 px-4 text-sm">
              {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleting} title="Delete Schedule"
        message={`Delete this schedule entry?`}
        onConfirm={confirmDelete} onCancel={() => setDeleting(null)} loading={deleteLoading} />
    </div>
  );
}
