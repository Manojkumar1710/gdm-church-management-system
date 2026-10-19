import { useEffect, useState } from 'react';
import { pastorService } from '../services/pastorService';
import AdminTable from './components/AdminTable';
import ConfirmDialog from './components/ConfirmDialog';
import Modal from '../components/Modal';
import TimePicker, { formatTime } from '../components/TimePicker';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';

const EMPTY = { pastorId: '', serviceDate: '', serviceType: 'Sunday Service', startTime: '', endTime: '', notes: '' };

export default function AdminSchedulePage() {
  const { t, dateLocale } = useLanguage();
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

  const entity = t('admin.entity.schedule');

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
    if (!form.pastorId) e.pastorId = t('admin.validate.pastorRequired');
    if (!form.serviceDate) e.serviceDate = t('admin.validate.dateRequired');
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
      toast.success(t(editing ? 'admin.toast.updated' : 'admin.toast.created', { entity }));
      setModal(false); load();
    } catch (err) {
      toast.error(err.response?.data?.message || t('admin.toast.saveFailed'));
    } finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await pastorService.deleteSchedule(deleting.id);
      toast.success(t('admin.toast.deleted', { entity }));
      setDeleting(null); load();
    } catch { toast.error(t('admin.toast.deleteFailed')); } finally { setDeleteLoading(false); }
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  const cols = [
    { key: 'serviceDate', label: t('admin.col.date'), render: r => r.serviceDate ? new Date(r.serviceDate).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
    { key: 'serviceType', label: t('admin.col.service') },
    { key: 'pastorName', label: t('admin.col.pastor') },
    { key: 'pastorVillage', label: t('admin.col.village') },
    { key: 'startTime', label: t('admin.col.start'), render: r => formatTime(r.startTime) },
    { key: 'endTime', label: t('admin.col.end'), render: r => formatTime(r.endTime) },
  ];

  return (
    <div>
      <div className="page-header">
        <p className="page-subtitle">{t('admin.pageDesc.schedule')}</p>
        <button onClick={openCreate} className="btn-primary btn-sm">+ {t('admin.action.add', { entity })}</button>
      </div>

      <AdminTable columns={cols} rows={rows} loading={loading} onEdit={openEdit} onDelete={setDeleting}
        emptyMessage={t('admin.empty.schedule')} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? t('admin.action.edit', { entity }) : t('admin.action.add', { entity })}>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="form-label" htmlFor="sc-pastor">{t('admin.form.pastor')} *</label>
            <select id="sc-pastor" className={`form-input ${errors.pastorId ? 'border-red-400' : ''}`} {...f('pastorId')}>
              <option value="">{t('admin.form.selectPlaceholder')}</option>
              {pastors.map(p => <option key={p.id} value={p.id}>{p.name} — {p.village || '—'}</option>)}
            </select>
            {errors.pastorId && <p className="form-error">{errors.pastorId}</p>}
          </div>
          <div>
            <label className="form-label" htmlFor="sc-date">{t('admin.form.serviceDate')} *</label>
            <input id="sc-date" type="date" className={`form-input ${errors.serviceDate ? 'border-red-400' : ''}`} {...f('serviceDate')} />
            {errors.serviceDate && <p className="form-error">{errors.serviceDate}</p>}
          </div>
          <div>
            <label className="form-label" htmlFor="sc-type">{t('admin.form.serviceType')}</label>
            <input id="sc-type" className="form-input" {...f('serviceType')} placeholder="Sunday Service, Prayer Meeting…" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TimePicker
              label={t('admin.form.startTime')}
              value={form.startTime}
              onChange={v => setForm(p => ({ ...p, startTime: v }))}
            />
            <TimePicker
              label={t('admin.form.endTime')}
              value={form.endTime}
              onChange={v => setForm(p => ({ ...p, endTime: v }))}
            />
          </div>
          <div>
            <label className="form-label" htmlFor="sc-notes">{t('admin.form.notes')}</label>
            <textarea id="sc-notes" rows={2} className="form-input resize-none" {...f('notes')} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary btn-sm">{t('common.cancel')}</button>
            <button type="submit" disabled={saving} className="btn-primary btn-sm">
              {saving ? t('admin.action.saving') : editing ? t('common.save') : t('admin.action.create', { entity })}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleting} title={t('admin.confirm.delete', { entity })}
        message={t('admin.confirm.deleteGeneric')}
        onConfirm={confirmDelete} onCancel={() => setDeleting(null)} loading={deleteLoading} />
    </div>
  );
}
