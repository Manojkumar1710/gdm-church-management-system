import { useEffect, useState } from 'react';
import { pastorService } from '../services/pastorService';
import AdminTable from './components/AdminTable';
import Pagination from './components/Pagination';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';
import { CalendarIcon, ExclamationTriangleIcon, TrashIcon } from '@heroicons/react/24/outline';

const EMPTY = {
  name: '', village: '', contactNumber: '', email: '',
  bio: '', active: true, contactPublic: false,
};

function DeletePastorDialog({ pastor, onConfirm, onCancel }) {
  const { t, dateLocale } = useLanguage();
  const [schedules,  setSchedules]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!pastor) return;
    setLoading(true);
    pastorService.getPastorSchedules(pastor.id)
      .then(r => setSchedules(r.data.data || []))
      .catch(() => setSchedules([]))
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

  const fmt = (d) => d
    ? new Date(d + 'T00:00:00').toLocaleDateString(dateLocale, { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />

      <div className="dialog-panel relative w-full max-w-md animate-slide-up" role="dialog" aria-modal="true" aria-labelledby="del-pastor-title">
        <div className="flex items-center gap-3 px-6 pt-6 pb-4">
          <div className="p-2.5 rounded-xl bg-red-50">
            <TrashIcon className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 id="del-pastor-title" className="dialog-title">{t('admin.pastor.deleteTitle')}</h3>
            <p className="text-gray-500 text-sm">{t('admin.pastor.cannotUndo')}</p>
          </div>
        </div>

        <div className="px-6 pb-6 space-y-4">
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

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
              <div className="h-4 w-4 border-2 border-gray-300 border-t-church-blue rounded-full animate-spin" />
              {t('admin.pastor.checkingSchedules')}
            </div>
          ) : hasSchedules ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 overflow-hidden">
              <div className="flex items-start gap-2.5 px-4 py-3 border-b border-amber-200">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 font-medium">
                  {t('admin.pastor.hasSchedules', { name: pastor.name, count: schedules.length })}
                </p>
              </div>

              <div className="divide-y divide-amber-100 max-h-48 overflow-y-auto">
                {schedules.map(s => (
                  <div key={s.id} className="flex items-center gap-3 px-4 py-2.5">
                    <CalendarIcon className="h-4 w-4 text-amber-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-amber-900">{fmt(s.serviceDate)}</p>
                      <p className="text-xs text-amber-700 truncate">
                        {s.serviceType || t('admin.form.serviceType')}
                        {s.startTime ? ` · ${s.startTime}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 py-1">
              {t('admin.pastor.noSchedules', { name: pastor.name })}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onCancel}
              disabled={confirming}
              className="btn-ghost flex-1 justify-center"
              type="button"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="btn-danger flex-1 justify-center"
              type="button"
            >
              {confirming ? (
                <>
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('admin.pastor.deleting')}
                </>
              ) : (
                <>
                  <TrashIcon className="h-4 w-4" />
                  {hasSchedules
                    ? t('admin.pastor.deleteWithSchedule', { count: schedules.length })
                    : t('admin.confirm.delete', { entity: t('admin.entity.pastor') })}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPastorsPage() {
  const { t } = useLanguage();
  const [rows,         setRows]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [page,         setPage]         = useState(0);
  const [totalPages,   setTotalPages]   = useState(0);
  const [modal,        setModal]        = useState(false);
  const [form,         setForm]         = useState(EMPTY);
  const [editing,      setEditing]      = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [deleting,     setDeleting]     = useState(null);
  const [photoFile,    setPhotoFile]    = useState(null);
  const [errors,       setErrors]       = useState({});

  const entity = t('admin.entity.pastor');

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
    if (!form.name.trim()) e.name = t('admin.validate.nameRequired');
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
      toast.success(t(editing ? 'admin.toast.updated' : 'admin.toast.created', { entity }));
      setModal(false);
      load(page);
    } catch (err) {
      toast.error(err.response?.data?.message || t('admin.toast.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await pastorService.delete(deleting.id);
      toast.success(t('admin.pastor.deleted', { name: deleting.name }));
      setDeleting(null);
      load(page);
    } catch {
      toast.error(t('admin.toast.deleteFailed'));
    }
  };

  const f = (key) => ({
    value: form[key],
    onChange: e => setForm(p => ({ ...p, [key]: e.target.value })),
  });

  const cols = [
    {
      key: 'photoUrl', label: t('admin.pastor.photo'),
      render: r => r.photoUrl
        ? <img src={r.photoUrl} alt={r.name} className="h-10 w-10 rounded-full object-cover border border-church-border" />
        : <div className="h-10 w-10 rounded-full bg-church-blue text-white flex items-center justify-center font-bold text-sm">{r.name?.[0]}</div>,
    },
    { key: 'name',          label: t('admin.form.name') },
    { key: 'village',       label: t('admin.col.village') },
    { key: 'contactNumber', label: t('admin.pastor.contactNumber'), render: r => r.contactNumber || '—' },
    {
      key: 'active', label: t('admin.col.status'),
      render: r => <span className={`pill ${r.active ? 'pill--success' : 'pill--muted'}`}>
        {r.active ? t('admin.status.YES') : t('admin.pastor.inactive')}
      </span>,
    },
    {
      key: 'contactPublic', label: t('admin.pastor.showContactPublic'),
      render: r => <span className={`pill ${r.contactPublic ? 'pill--info' : 'pill--muted'}`}>
        {t(r.contactPublic ? 'admin.status.YES' : 'admin.status.NO')}
      </span>,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <p className="page-subtitle">{t('admin.pageDesc.pastors')}</p>
        <button onClick={openCreate} className="btn-primary btn-sm">+ {t('admin.action.add', { entity })}</button>
      </div>

      <AdminTable
        columns={cols}
        rows={rows}
        loading={loading}
        onEdit={openEdit}
        onDelete={setDeleting}
        emptyMessage={t('admin.empty.pastors')}
      />
      <Pagination page={page} totalPages={totalPages} onPageChange={load} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? t('admin.action.edit', { entity }) : t('admin.action.add', { entity })} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="form-label" htmlFor="p-name">{t('admin.form.name')} *</label>
              <input
                id="p-name"
                className={`form-input ${errors.name ? 'border-red-400' : ''}`}
                placeholder="Full name of the pastor"
                {...f('name')}
              />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>

            <div>
              <label className="form-label" htmlFor="p-village">{t('admin.col.village')}</label>
              <input id="p-village" className="form-input" placeholder="e.g. Yerramalla" {...f('village')} />
            </div>

            <div>
              <label className="form-label" htmlFor="p-contact">{t('admin.pastor.contactNumber')}</label>
              <input id="p-contact" className="form-input" placeholder="+91-9XXXXXXXXX" {...f('contactNumber')} />
            </div>

            <div>
              <label className="form-label" htmlFor="p-email">{t('admin.form.email')}</label>
              <input id="p-email" type="email" className="form-input" placeholder="pastor@example.com" {...f('email')} />
            </div>

            <div className="md:col-span-2">
              <label className="form-label" htmlFor="p-bio">{t('admin.pastor.bio')}</label>
              <textarea id="p-bio" rows={3} className="form-input resize-none" placeholder="Brief biography…" {...f('bio')} />
            </div>

            <div className="md:col-span-2">
              <label className="form-label" htmlFor="p-photo">{t('admin.pastor.photo')}</label>
              <input
                id="p-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="form-input py-2 cursor-pointer"
                onChange={e => setPhotoFile(e.target.files[0])}
              />
              <p className="text-gray-400 text-xs mt-1">{t('admin.pastor.photoHint')}</p>
              {editing?.photoUrl && !photoFile && (
                <div className="mt-2 flex items-center gap-3">
                  <img src={editing.photoUrl} alt={t('admin.form.image')} className="h-14 w-14 rounded-full object-cover border-2 border-gray-200" />
                  <span className="text-xs text-gray-400">{t('admin.pastor.currentPhoto')}</span>
                </div>
              )}
            </div>

            <div className="md:col-span-2 flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="rounded" checked={form.active}
                  onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} />
                {t('admin.col.active')}
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="rounded" checked={form.contactPublic}
                  onChange={e => setForm(p => ({ ...p, contactPublic: e.target.checked }))} />
                {t('admin.pastor.showContactPublic')}
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary btn-sm">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={saving} className="btn-primary btn-sm">
              {saving ? t('admin.action.saving') : editing ? t('admin.action.update', { entity }) : t('admin.action.create', { entity })}
            </button>
          </div>
        </form>
      </Modal>

      <DeletePastorDialog
        pastor={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
