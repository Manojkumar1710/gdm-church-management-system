import { useEffect, useState } from 'react';
import { pastorService } from '../services/pastorService';
import AdminTable from './components/AdminTable';
import Pagination from './components/Pagination';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { CalendarIcon, ExclamationTriangleIcon, TrashIcon } from '@heroicons/react/24/outline';

const EMPTY = {
  name: '', village: '', contactNumber: '', email: '',
  bio: '', active: true, contactPublic: false,
};

/* ── Smart Delete Dialog ───────────────────────────────────────────
   Shows pastor name + list of their schedules (if any) before confirm.
   ─────────────────────────────────────────────────────────────────── */
function DeletePastorDialog({ pastor, onConfirm, onCancel }) {
  const [schedules,  setSchedules]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!pastor) return;
    setLoading(true);
    pastorService.getPastorSchedules(pastor.id)
      .then(r => setSchedules(r.data.data || []))
      .catch(() => setSchedules([]))   // if fetch fails, still allow delete
      .finally(() => setLoading(false));
  }, [pastor]);

  if (!pastor) return null;

  const hasSchedules = schedules.length > 0;

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await onConfirm();
    } finally {
      setConfirming(false);
    }
  };

  // Format date nicely
  const fmt = (d) => d
    ? new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-4">
          <div className="p-2.5 rounded-xl bg-red-50">
            <TrashIcon className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Delete Pastor</h3>
            <p className="text-gray-500 text-sm">This action cannot be undone</p>
          </div>
        </div>

        <div className="px-6 pb-6 space-y-4">

          {/* Pastor name highlight */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
            {pastor.photoUrl
              ? <img src={pastor.photoUrl} alt={pastor.name} className="h-10 w-10 rounded-full object-cover shrink-0" />
              : <div className="h-10 w-10 rounded-full bg-church-blue text-white flex items-center justify-center font-bold shrink-0">
                  {pastor.name?.[0]}
                </div>
            }
            <div>
              <p className="font-semibold text-gray-800">{pastor.name}</p>
              {pastor.village && <p className="text-xs text-gray-500">{pastor.village}</p>}
            </div>
          </div>

          {/* Schedule warning */}
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
              <div className="h-4 w-4 border-2 border-gray-300 border-t-church-blue rounded-full animate-spin" />
              Checking schedules…
            </div>
          ) : hasSchedules ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 overflow-hidden">
              {/* Warning banner */}
              <div className="flex items-start gap-2.5 px-4 py-3 border-b border-amber-200">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 font-medium">
                  {pastor.name} has <strong>{schedules.length}</strong> scheduled{' '}
                  {schedules.length === 1 ? 'service' : 'services'}.
                  Deleting this pastor profile will also permanently remove{' '}
                  {schedules.length === 1 ? 'that schedule' : 'all those schedules'}.
                </p>
              </div>

              {/* Schedule list */}
              <div className="divide-y divide-amber-100 max-h-48 overflow-y-auto">
                {schedules.map(s => (
                  <div key={s.id} className="flex items-center gap-3 px-4 py-2.5">
                    <CalendarIcon className="h-4 w-4 text-amber-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-amber-900">{fmt(s.serviceDate)}</p>
                      <p className="text-xs text-amber-700 truncate">
                        {s.serviceType || 'Sunday Service'}
                        {s.startTime ? ` · ${s.startTime}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 py-1">
              Are you sure you want to delete <strong>{pastor.name}</strong>?
              This pastor has no scheduled services.
            </p>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onCancel}
              disabled={confirming}
              className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700
                         font-semibold text-sm hover:border-gray-300 hover:bg-gray-50
                         transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold
                         text-sm hover:bg-red-700 transition-colors disabled:opacity-50
                         flex items-center justify-center gap-2"
            >
              {confirming ? (
                <>
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <TrashIcon className="h-4 w-4" />
                  {hasSchedules
                    ? `Delete Pastor + ${schedules.length} Schedule${schedules.length > 1 ? 's' : ''}`
                    : 'Delete Pastor'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────────── */
export default function AdminPastorsPage() {
  const [rows,         setRows]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [page,         setPage]         = useState(0);
  const [totalPages,   setTotalPages]   = useState(0);
  const [modal,        setModal]        = useState(false);
  const [form,         setForm]         = useState(EMPTY);
  const [editing,      setEditing]      = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [deleting,     setDeleting]     = useState(null);   // pastor object to delete
  const [photoFile,    setPhotoFile]    = useState(null);
  const [errors,       setErrors]       = useState({});

  const load = (p = 0) => {
    setLoading(true);
    pastorService.adminList(p, 20)
      .then(r => {
        const d = r.data.data;
        setRows(d.content);
        setTotalPages(d.totalPages);
        setPage(p);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => load(0), []);

  const openCreate = () => {
    setEditing(null); setForm(EMPTY); setPhotoFile(null); setErrors({}); setModal(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      name:          row.name          || '',
      village:       row.village       || '',
      contactNumber: row.contactNumber || '',
      email:         row.email         || '',
      bio:           row.bio           || '',
      active:        row.active,
      contactPublic: row.contactPublic,
    });
    setPhotoFile(null); setErrors({}); setModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      let saved;
      if (editing) {
        saved = await pastorService.update(editing.id, form);
      } else {
        saved = await pastorService.create(form);
      }
      if (photoFile) {
        await pastorService.uploadPhoto(saved.data.data.id, photoFile);
      }
      toast.success(editing ? 'Pastor updated' : 'Pastor created');
      setModal(false);
      load(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await pastorService.delete(deleting.id);
      toast.success(`${deleting.name} has been deleted`);
      setDeleting(null);
      load(page);
    } catch {
      toast.error('Delete failed. Please try again.');
    }
  };

  const f = (key) => ({
    value: form[key],
    onChange: e => setForm(p => ({ ...p, [key]: e.target.value })),
  });

  const cols = [
    {
      key: 'photoUrl', label: 'Photo',
      render: r => r.photoUrl
        ? <img src={r.photoUrl} alt={r.name} className="h-10 w-10 rounded-full object-cover border border-gray-100" />
        : <div className="h-10 w-10 rounded-full bg-church-blue text-white flex items-center justify-center font-bold text-sm">{r.name?.[0]}</div>,
    },
    { key: 'name',          label: 'Name' },
    { key: 'village',       label: 'Village' },
    { key: 'contactNumber', label: 'Contact' },
    {
      key: 'active', label: 'Status',
      render: r => <span className={`badge ${r.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
        {r.active ? '✓ Active' : '✗ Inactive'}
      </span>,
    },
    {
      key: 'contactPublic', label: 'Contact Public',
      render: r => <span className={`badge ${r.contactPublic ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
        {r.contactPublic ? 'Yes' : 'No'}
      </span>,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-church-blue" style={{ fontFamily: 'Lora, Georgia, serif' }}>
            Pastors
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage pastor profiles</p>
        </div>
        <button onClick={openCreate} className="btn-primary">+ Add Pastor</button>
      </div>

      <AdminTable
        columns={cols}
        rows={rows}
        loading={loading}
        onEdit={openEdit}
        onDelete={setDeleting}   // passes the full row object
      />
      <Pagination page={page} totalPages={totalPages} onPageChange={load} />

      {/* ── Add / Edit modal ── */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Pastor' : 'Add Pastor'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="form-label">Name *</label>
              <input
                className={`form-input ${errors.name ? 'border-red-400' : ''}`}
                placeholder="Full name of the pastor"
                {...f('name')}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="form-label">Village</label>
              <input className="form-input" placeholder="e.g. Yerramalla" {...f('village')} />
            </div>

            <div>
              <label className="form-label">Contact Number</label>
              <input className="form-input" placeholder="+91-9XXXXXXXXX" {...f('contactNumber')} />
            </div>

            <div>
              <label className="form-label">Email</label>
              <input type="email" className="form-input" placeholder="pastor@example.com" {...f('email')} />
            </div>

            <div className="md:col-span-2">
              <label className="form-label">Bio</label>
              <textarea rows={3} className="form-input resize-none" placeholder="Brief biography…" {...f('bio')} />
            </div>

            <div className="md:col-span-2">
              <label className="form-label">Pastor Photo</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="form-input py-2 cursor-pointer"
                onChange={e => setPhotoFile(e.target.files[0])}
              />
              <p className="text-gray-400 text-xs mt-1">JPG, PNG or WebP — max 20 MB</p>
              {editing?.photoUrl && !photoFile && (
                <div className="mt-2 flex items-center gap-3">
                  <img src={editing.photoUrl} alt="current" className="h-14 w-14 rounded-full object-cover border-2 border-gray-200" />
                  <span className="text-xs text-gray-400">Current photo — choose a new file to replace it</span>
                </div>
              )}
            </div>

            <div className="md:col-span-2 flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="rounded" checked={form.active}
                  onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="rounded" checked={form.contactPublic}
                  onChange={e => setForm(p => ({ ...p, contactPublic: e.target.checked }))} />
                Show contact publicly
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary py-2 px-5 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary py-2 px-5 text-sm">
              {saving ? 'Saving…' : editing ? 'Update Pastor' : 'Create Pastor'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Smart Delete Dialog ── */}
      <DeletePastorDialog
        pastor={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
