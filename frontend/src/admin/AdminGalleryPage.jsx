import { useEffect, useState } from 'react';
import { galleryService } from '../services/galleryService';
import AdminTable from './components/AdminTable';
import Pagination from './components/Pagination';
import ConfirmDialog from './components/ConfirmDialog';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';

export default function AdminGalleryPage() {
  const { t } = useLanguage();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: '', published: true });
  const [imageFile, setImageFile] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const entity = t('admin.entity.galleryImage');

  const load = (p = 0) => {
    setLoading(true);
    galleryService.adminList(p, 20)
      .then(r => { const d = r.data.data; setRows(d.content); setTotalPages(d.totalPages); setPage(p); })
      .finally(() => setLoading(false));
  };

  useEffect(() => load(0), []);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', description: '', category: '', published: true });
    setImageFile(null); setErrors({}); setModal(true);
  };
  const openEdit = (row) => {
    setEditing(row);
    setForm({ title: row.title || '', description: row.description || '',
      category: row.category || '', published: row.published });
    setImageFile(null); setErrors({}); setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!editing && !imageFile) { setErrors({ image: t('admin.validate.imageRequired') }); return; }
    setSaving(true);
    try {
      if (editing) {
        await galleryService.update(editing.id, form);
      } else {
        await galleryService.create(imageFile, form.title, form.description, form.category);
      }
      toast.success(t(editing ? 'admin.toast.updated' : 'admin.toast.created', { entity }));
      setModal(false); load(page);
    } catch (err) { toast.error(err.response?.data?.message || t('admin.toast.saveFailed')); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try { await galleryService.delete(deleting.id); toast.success(t('admin.toast.deleted', { entity })); setDeleting(null); load(page); }
    catch { toast.error(t('admin.toast.deleteFailed')); } finally { setDeleteLoading(false); }
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  const cols = [
    { key: 'imageUrl', label: t('admin.col.image'), render: r => <img src={r.imageUrl} alt={r.title || ''} className="h-11 w-16 rounded-lg border border-church-border object-cover" loading="lazy" /> },
    { key: 'title', label: t('admin.col.title') },
    { key: 'category', label: t('admin.col.category') },
    { key: 'published', label: t('admin.col.published'), render: r => (
      <span className={`pill ${r.published ? 'pill--success' : 'pill--muted'}`}>
        {t(`admin.status.${r.published ? 'YES' : 'NO'}`)}
      </span>
    ) },
    { key: 'createdAt', label: t('admin.col.added'), render: r => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—' },
  ];

  return (
    <div>
      <div className="page-header">
        <p className="page-subtitle">{t('admin.pageDesc.gallery')}</p>
        <button onClick={openCreate} className="btn-primary btn-sm">+ {t('admin.action.addImage')}</button>
      </div>

      <AdminTable columns={cols} rows={rows} loading={loading} onEdit={openEdit} onDelete={setDeleting}
        emptyMessage={t('admin.empty.gallery')} />
      <Pagination page={page} totalPages={totalPages} onPageChange={load} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? t('admin.action.edit', { entity }) : t('admin.action.addImage')}>
        <form onSubmit={save} className="space-y-4">
          {!editing && (
            <div>
              <label className="form-label" htmlFor="g-img">{t('admin.form.image')} *</label>
              <input id="g-img" type="file" accept="image/jpeg,image/png,image/webp" className={`form-input py-2 ${errors.image ? 'border-red-400' : ''}`}
                onChange={e => { setImageFile(e.target.files[0]); setErrors({}); }} />
              {errors.image && <p className="form-error">{errors.image}</p>}
            </div>
          )}
          <div>
            <label className="form-label" htmlFor="g-title">{t('admin.form.title')}</label>
            <input id="g-title" className="form-input" {...f('title')} />
          </div>
          <div>
            <label className="form-label" htmlFor="g-cat">{t('admin.form.category')}</label>
            <input id="g-cat" className="form-input" {...f('category')} placeholder="Worship, Events, Community…" />
          </div>
          <div>
            <label className="form-label" htmlFor="g-desc">{t('admin.form.description')}</label>
            <textarea id="g-desc" rows={2} className="form-input resize-none" {...f('description')} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="gpub" className="rounded" checked={form.published}
              onChange={e => setForm(p => ({ ...p, published: e.target.checked }))} />
            <label htmlFor="gpub" className="text-sm text-gray-700">{t('admin.form.published')}</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary btn-sm">{t('common.cancel')}</button>
            <button type="submit" disabled={saving} className="btn-primary btn-sm">
              {saving ? t('admin.action.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleting} title={t('admin.confirm.delete', { entity })}
        message={deleting?.title ? t('admin.confirm.deleteNamed', { name: deleting.title }) : t('admin.confirm.deleteGeneric')}
        onConfirm={confirmDelete} onCancel={() => setDeleting(null)} loading={deleteLoading} />
    </div>
  );
}
