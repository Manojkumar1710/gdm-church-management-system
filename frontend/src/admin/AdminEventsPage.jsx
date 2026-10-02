import { useEffect, useState } from 'react';
import { eventService } from '../services/eventService';
import AdminTable from './components/AdminTable';
import Pagination from './components/Pagination';
import ConfirmDialog from './components/ConfirmDialog';
import Modal from '../components/Modal';
import TimePicker, { formatTime } from '../components/TimePicker';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  title: '', description: '', eventDate: '', startTime: '', endTime: '',
  location: '', status: 'UPCOMING', registrationRequired: false, capacity: '',
};

export default function AdminEventsPage() {
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
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.eventDate) e.eventDate = 'Event date is required';
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
      toast.success(editing ? 'Event updated' : 'Event created');
      setModal(false);
      load(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await eventService.delete(deleting.id);
      toast.success('Event deleted');
      setDeleting(null);
      load(page);
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  const statusBadge = (status) => {
    const map = { UPCOMING: 'bg-green-100 text-green-700', COMPLETED: 'bg-gray-100 text-gray-600', CANCELLED: 'bg-red-100 text-red-600', DRAFT: 'bg-yellow-100 text-yellow-700', ONGOING: 'bg-blue-100 text-blue-700' };
    return <span className={`badge ${map[status] || 'bg-gray-100 text-gray-500'}`}>{status}</span>;
  };

  const cols = [
    { key: 'title', label: 'Title' },
    { key: 'eventDate', label: 'Date' },
    { key: 'location', label: 'Location' },
    { key: 'startTime', label: 'Time', render: r => r.startTime ? `${formatTime(r.startTime)}${r.endTime ? ' – ' + formatTime(r.endTime) : ''}` : '—' },
    { key: 'status', label: 'Status', render: r => statusBadge(r.status) },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-church-blue">Events</h1>
          <p className="text-gray-500 text-sm">Manage church events</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm py-2 px-4">+ Add Event</button>
      </div>

      <AdminTable columns={cols} rows={rows} loading={loading}
        onEdit={openEdit} onDelete={setDeleting} />
      <Pagination page={page} totalPages={totalPages} onPageChange={load} />

      {/* Form modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Event' : 'Add Event'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="form-label">Title *</label>
              <input className={`form-input ${errors.title ? 'border-red-400' : ''}`} {...f('title')} />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="form-label">Event Date *</label>
              <input type="date" className={`form-input ${errors.eventDate ? 'border-red-400' : ''}`} {...f('eventDate')} />
              {errors.eventDate && <p className="text-red-500 text-xs mt-1">{errors.eventDate}</p>}
            </div>
            <div>
              <label className="form-label">Status</label>
              <select className="form-input" {...f('status')}>
                {['DRAFT','UPCOMING','ONGOING','COMPLETED','CANCELLED'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <TimePicker
                label="Start Time"
                value={form.startTime}
                onChange={v => setForm(p => ({ ...p, startTime: v }))}
              />
            </div>
            <div>
              <TimePicker
                label="End Time"
                value={form.endTime}
                onChange={v => setForm(p => ({ ...p, endTime: v }))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="form-label">Location</label>
              <input className="form-input" {...f('location')} placeholder="Venue / address" />
            </div>
            <div>
              <label className="form-label">Capacity</label>
              <input type="number" min="1" className="form-input" {...f('capacity')} placeholder="Leave blank for unlimited" />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input
                id="reg"
                type="checkbox"
                checked={form.registrationRequired}
                onChange={e => setForm(p => ({ ...p, registrationRequired: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="reg" className="text-sm text-gray-700">Registration required</label>
            </div>
            <div className="md:col-span-2">
              <label className="form-label">Description</label>
              <textarea rows={4} className="form-input resize-none" {...f('description')} placeholder="Event details…" />
            </div>
            <div className="md:col-span-2">
              <label className="form-label">Event Image</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="form-input py-2"
                onChange={e => setImageFile(e.target.files[0])}
              />
              {editing?.imageUrl && !imageFile && (
                <img src={editing.imageUrl} alt="current" className="mt-2 h-24 rounded-lg object-cover" />
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary py-2 px-4 text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary py-2 px-4 text-sm">
              {saving ? 'Saving…' : editing ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete Event"
        message={`Delete "${deleting?.title}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
