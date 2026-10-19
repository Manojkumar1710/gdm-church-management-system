import { useEffect, useState } from 'react';
import { youtubeService } from '../services/sermonService';
import AdminTable from './components/AdminTable';
import Pagination from './components/Pagination';
import ConfirmDialog from './components/ConfirmDialog';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';

const EMPTY = { title: '', description: '', youtubeUrl: '', thumbnailUrl: '', category: '', publishedDate: '', published: true };

export default function AdminYoutubePage() {
  const { t } = useLanguage();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const entity = t('admin.entity.video');

  const load = (p = 0) => {
    setLoading(true);
    youtubeService.adminList(p, 20)
      .then(r => { const d = r.data.data; setRows(d.content); setTotalPages(d.totalPages); setPage(p); })
      .finally(() => setLoading(false));
  };

  useEffect(() => load(0), []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setErrors({}); setModal(true); };
  const openEdit = (row) => {
    setEditing(row);
    setForm({ title: row.title, description: row.description || '', youtubeUrl: row.youtubeUrl,
      thumbnailUrl: row.thumbnailUrl || '', category: row.category || '',
      publishedDate: row.publishedDate || '', published: row.published });
    setErrors({}); setModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = t('admin.validate.titleRequired');
    if (!form.youtubeUrl.trim()) e.youtubeUrl = t('admin.validate.urlRequired');
    else if (!/youtube\.com|youtu\.be/.test(form.youtubeUrl)) e.youtubeUrl = t('admin.validate.urlInvalid');
    setErrors(e); return Object.keys(e).length === 0;
  };

  const save = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (editing) await youtubeService.update(editing.id, form);
      else await youtubeService.create(form);
      toast.success(t(editing ? 'admin.toast.updated' : 'admin.toast.created', { entity }));
      setModal(false); load(page);
    } catch (err) { toast.error(err.response?.data?.message || t('admin.toast.saveFailed')); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try { await youtubeService.delete(deleting.id); toast.success(t('admin.toast.deleted', { entity })); setDeleting(null); load(page); }
    catch { toast.error(t('admin.toast.deleteFailed')); } finally { setDeleteLoading(false); }
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  const cols = [
    { key: 'title', label: t('admin.col.title') },
    { key: 'category', label: t('admin.col.category') },
    { key: 'publishedDate', label: t('admin.col.date') },
    { key: 'youtubeUrl', label: t('admin.col.link'), render: r => (
      <a href={r.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-church-blue hover:underline">
        {t('admin.action.openLink')}
      </a>
    ) },
    { key: 'published', label: t('admin.col.published'), render: r => (
      <span className={`pill ${r.published ? 'pill--success' : 'pill--muted'}`}>
        {t(`admin.status.${r.published ? 'YES' : 'NO'}`)}
      </span>
    ) },
  ];

  return (
    <div>
      <div className="page-header">
        <p className="page-subtitle">{t('admin.pageDesc.youtube')}</p>
        <button onClick={openCreate} className="btn-primary btn-sm">+ {t('admin.action.add', { entity })}</button>
      </div>

      <AdminTable columns={cols} rows={rows} loading={loading} onEdit={openEdit} onDelete={setDeleting}
        emptyMessage={t('admin.empty.youtube')} />
      <Pagination page={page} totalPages={totalPages} onPageChange={load} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? t('admin.action.edit', { entity }) : t('admin.action.add', { entity })} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="form-label" htmlFor="yt-title">{t('admin.form.title')} *</label>
            <input id="yt-title" className={`form-input ${errors.title ? 'border-red-400' : ''}`} {...f('title')} />
            {errors.title && <p className="form-error">{errors.title}</p>}
          </div>
          <div>
            <label className="form-label" htmlFor="yt-url">{t('admin.form.youtubeUrl')} *</label>
            <input id="yt-url" className={`form-input ${errors.youtubeUrl ? 'border-red-400' : ''}`} {...f('youtubeUrl')} placeholder="https://youtube.com/watch?v=..." />
            {errors.youtubeUrl && <p className="form-error">{errors.youtubeUrl}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label" htmlFor="yt-cat">{t('admin.form.category')}</label>
              <input id="yt-cat" className="form-input" {...f('category')} placeholder="Sermon, Worship, Event…" />
            </div>
            <div>
              <label className="form-label" htmlFor="yt-date">{t('admin.form.publishedDate')}</label>
              <input id="yt-date" type="date" className="form-input" {...f('publishedDate')} />
            </div>
          </div>
          <div>
            <label className="form-label" htmlFor="yt-thumb">{t('admin.form.thumbnailUrl')}</label>
            <input id="yt-thumb" className="form-input" {...f('thumbnailUrl')} placeholder="https://…" />
          </div>
          <div>
            <label className="form-label" htmlFor="yt-desc">{t('admin.form.description')}</label>
            <textarea id="yt-desc" rows={3} className="form-input resize-none" {...f('description')} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="ypub" className="rounded" checked={form.published}
              onChange={e => setForm(p => ({ ...p, published: e.target.checked }))} />
            <label htmlFor="ypub" className="text-sm text-gray-700">{t('admin.form.published')}</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary btn-sm">{t('common.cancel')}</button>
            <button type="submit" disabled={saving} className="btn-primary btn-sm">
              {saving ? t('admin.action.saving') : editing ? t('common.save') : t('admin.action.add', { entity })}
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
