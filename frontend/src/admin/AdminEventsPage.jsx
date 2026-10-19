import { useEffect, useState } from 'react';
import { eventService } from '../services/eventService';
import AdminTable from './components/AdminTable';
import Pagination from './components/Pagination';
import ConfirmDialog from './components/ConfirmDialog';
import Modal from '../components/Modal';
import TimePicker, { formatTime } from '../components/TimePicker';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';

const EMPTY_FORM = {
  title: '', description: '', eventDate: '', startTime: '', endTime: '',
  location: '', status: 'UPCOMING', registrationRequired: false, capacity: '',
};

const STATUS_PILL = {
  DRAFT:     'pill--muted',
  UPCOMING:  'pill--navy',
  ONGOING:   'pill--info',
  COMPLETED: 'pill--success',
  CANCELLED: 'pill--danger',
};

const STATUSES = ['DRAFT', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'];

export default function AdminEventsPage() {
  const { t } = useLanguage();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});

  const entity = t('admin.entity.event');

  const load = (p = 0) => {
    setLoading(true);
    eventService.adminList(p, 20)
      .then(r => { const d = r.data.data; setRows(d.content); setTotalPages(d.totalPages); setPage(p); })
      .finally(() => setLoading(false));
  };

  useEffect(() => load(0), []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setImageFile(null); setErrors({}); setModal(true); };
  const openEdit = (row) => {
    setEditing(row);
    setForm({
      title: row.title || '', description: row.description || '',
      eventDate: row.eventDate || '', startTime: row.startTime || '',
      endTime: row.endTime || '', location: row.location || '',
      status: row.status || 'UPCOMING',
      registrationRequired: row.registrationRequired || false,
      capacity: row.capacity || '',
    });
    setImageFile(null); setErrors({}); setModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = t('admin.validate.titleRequired');
    if (!form.eventDate) e.eventDate = t('admin.validate.dateRequired');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form, capacity: form.capacity ? Number(form.capacity) : null };
      let saved;
      if (editing) {
        saved = await eventService.update(editing.id, payload);
      } else {
        saved = await eventService.create(payload);
      }
      const savedId = saved.data.data.id;
      if (imageFile) {
        await eventService.uploadImage(savedId, imageFile);
      }
      toast.success(t(editing ? 'admin.toast.updated' : 'admin.toast.created', { entity }));
      setModal(false);
      load(page);
    } catch (err) {
      toast.error(err.response?.data?.message || t('admin.toast.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await eventService.delete(deleting.id);
      toast.success(t('admin.toast.deleted', { entity }));
      setDeleting(null);
      load(page);
    } catch {
      toast.error(t('admin.toast.deleteFailed'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  const statusBadge = (status) => (
    <span className={`pill ${STATUS_PILL[status] || 'pill--muted'}`}>{t(`admin.status.${status}`)}</span>
  );

  const cols = [
    { key: 'title', label: t('admin.col.title') },
    { key: 'eventDate', label: t('admin.col.date') },
    { key: 'location', label: t('admin.col.location') },
    { key: 'startTime', label: t('admin.col.time'), render: r => r.startTime ? `${formatTime(r.startTime)}${r.endTime ? ' – ' + formatTime(r.endTime) : ''}` : '—' },
    { key: 'status', label: t('admin.col.status'), render: r => statusBadge(r.status) },
  ];

  return (
    <div>
      <div className="page-header">
        <p className="page-subtitle">{t('admin.pageDesc.events')}</p>
        <button onClick={openCreate} className="btn-primary btn-sm">+ {t('admin.action.add', { entity })}</button>
      </div>

      <AdminTable columns={cols} rows={rows} loading={loading}
        onEdit={openEdit} onDelete={setDeleting} emptyMessage={t('admin.empty.events')} />
      <Pagination page={page} totalPages={totalPages} onPageChange={load} />

      {/* Form modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? t('admin.action.edit', { entity }) : t('admin.action.add', { entity })} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="form-label" htmlFor="ev-title">{t('admin.form.title')} *</label>
              <input id="ev-title" className={`form-input ${errors.title ? 'border-red-400' : ''}`} {...f('title')} />
              {errors.title && <p className="form-error">{errors.title}</p>}
            </div>
            <div>
              <label className="form-label" htmlFor="ev-date">{t('admin.form.date')} *</label>
              <input id="ev-date" type="date" className={`form-input ${errors.eventDate ? 'border-red-400' : ''}`} {...f('eventDate')} />
              {errors.eventDate && <p className="form-error">{errors.eventDate}</p>}
            </div>
            <div>
              <label className="form-label" htmlFor="ev-status">{t('admin.form.status')}</label>
              <select id="ev-status" className="form-input" {...f('status')}>
                {STATUSES.map(s => <option key={s} value={s}>{t(`admin.status.${s}`)}</option>)}
              </select>
            </div>
            <div>
              <TimePicker
                label={t('admin.form.startTime')}
                value={form.startTime}
                onChange={v => setForm(p => ({ ...p, startTime: v }))}
              />
            </div>
            <div>
              <TimePicker
                label={t('admin.form.endTime')}
                value={form.endTime}
                onChange={v => setForm(p => ({ ...p, endTime: v }))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="form-label" htmlFor="ev-loc">{t('admin.form.location')}</label>
              <input id="ev-loc" className="form-input" {...f('location')} placeholder="Venue / address" />
            </div>
            <div>
              <label className="form-label" htmlFor="ev-cap">{t('admin.form.capacity')}</label>
              <input id="ev-cap" type="number" min="1" className="form-input" {...f('capacity')} placeholder="Unlimited" />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input
                id="reg"
                type="checkbox"
                checked={form.registrationRequired}
                onChange={e => setForm(p => ({ ...p, registrationRequired: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="reg" className="text-sm text-gray-700">{t('admin.form.registration')}</label>
            </div>
            <div className="md:col-span-2">
              <label className="form-label" htmlFor="ev-desc">{t('admin.form.description')}</label>
              <textarea id="ev-desc" rows={4} className="form-input resize-none" {...f('description')} placeholder="Event details…" />
            </div>
            <div className="md:col-span-2">
              <label className="form-label" htmlFor="ev-img">{t('admin.form.image')}</label>
              <input
                id="ev-img"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="form-input py-2"
                onChange={e => setImageFile(e.target.files[0])}
              />
              {editing?.imageUrl && !imageFile && (
                <img src={editing.imageUrl} alt={t('admin.form.image')} className="mt-3 h-24 w-36 rounded-xl border border-church-border object-cover" />
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary btn-sm">{t('common.cancel')}</button>
            <button type="submit" disabled={saving} className="btn-primary btn-sm">
              {saving ? t('admin.action.saving') : editing ? t('admin.action.update', { entity }) : t('admin.action.create', { entity })}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title={t('admin.confirm.delete', { entity })}
        message={deleting?.title ? t('admin.confirm.deleteNamed', { name: deleting.title }) : t('admin.confirm.deleteGeneric')}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
