import { useEffect, useState } from 'react';
import { sermonService } from '../services/sermonService';
import AdminTable from './components/AdminTable';
import Pagination from './components/Pagination';
import ConfirmDialog from './components/ConfirmDialog';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';
import { getYoutubeThumbnail } from '../utils/youtube';

const EMPTY = {
  title: '', description: '', speaker: '', sermonDate: '',
  videoUrl: '', audioUrl: '', duration: '', published: false,
};

export default function AdminSermonsPage() {
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
  const [deleteLoading,setDeleteLoading]= useState(false);
  const [thumbFile,    setThumbFile]    = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [errors,       setErrors]       = useState({});

  const entity = t('admin.entity.sermon');

  const load = (p = 0) => {
    setLoading(true);
    sermonService.adminList(p, 20)
      .then(r => { const d = r.data.data; setRows(d.content); setTotalPages(d.totalPages); setPage(p); })
      .finally(() => setLoading(false));
  };

  useEffect(() => load(0), []);

  const openCreate = () => {
    setEditing(null); setForm(EMPTY);
    setThumbFile(null); setThumbPreview(null); setErrors({});
    setModal(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      title: row.title || '', description: row.description || '',
      speaker: row.speaker || '', sermonDate: row.sermonDate || '',
      videoUrl: row.videoUrl || '', audioUrl: row.audioUrl || '',
      duration: row.duration || '', published: row.published,
    });
    setThumbFile(null);
    setThumbPreview(row.thumbnailUrl || getYoutubeThumbnail(row.videoUrl) || null);
    setErrors({});
    setModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = t('admin.validate.titleRequired');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      let saved;
      if (editing) saved = await sermonService.update(editing.id, form);
      else         saved = await sermonService.create(form);
      if (thumbFile) await sermonService.uploadThumbnail(saved.data.data.id, thumbFile);
      toast.success(t(editing ? 'admin.toast.updated' : 'admin.toast.created', { entity }));
      setModal(false);
      load(page);
    } catch (err) {
      toast.error(err.response?.data?.message || t('admin.toast.saveFailed'));
    } finally { setSaving(false); }
  };

  const handleThumbFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbFile(file);
    setThumbPreview(URL.createObjectURL(file));
  };

  const handleVideoUrl = (url) => {
    setForm(p => ({ ...p, videoUrl: url }));
    if (!thumbFile) {
      const ytThumb = getYoutubeThumbnail(url);
      setThumbPreview(ytThumb || null);
    }
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try { await sermonService.delete(deleting.id); toast.success(t('admin.toast.deleted', { entity })); setDeleting(null); load(page); }
    catch { toast.error(t('admin.toast.deleteFailed')); } finally { setDeleteLoading(false); }
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  const cols = [
    {
      key: 'thumbnailUrl', label: t('admin.col.image'),
      render: r => {
        const thumb = r.thumbnailUrl || getYoutubeThumbnail(r.videoUrl);
        return thumb
          ? <img src={thumb} alt={r.title} className="h-10 w-16 rounded-lg object-cover border border-church-border" onError={e => e.currentTarget.style.display='none'} />
          : <div className="h-10 w-16 rounded-lg bg-church-blue/10 flex items-center justify-center text-xs font-semibold text-church-blue">{t('admin.sermon.draft')}</div>;
      },
    },
    { key: 'title',   label: t('admin.col.title') },
    { key: 'speaker', label: t('admin.sermon.speaker'), render: r => r.speaker || '—' },
    { key: 'sermonDate', label: t('admin.col.date') },
    {
      key: 'published', label: t('admin.col.status'),
      render: r => <span className={`pill ${r.published ? 'pill--success' : 'pill--muted'}`}>
        {r.published ? t('admin.sermon.published') : t('admin.sermon.draft')}
      </span>,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <p className="page-subtitle">{t('admin.pageDesc.sermons')}</p>
        <button onClick={openCreate} className="btn-primary btn-sm">+ {t('admin.action.add', { entity })}</button>
      </div>

      <AdminTable columns={cols} rows={rows} loading={loading} onEdit={openEdit} onDelete={setDeleting}
        emptyMessage={t('admin.empty.sermons')} />
      <Pagination page={page} totalPages={totalPages} onPageChange={load} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? t('admin.action.edit', { entity }) : t('admin.action.add', { entity })} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="md:col-span-2">
              <label className="form-label" htmlFor="s-title">{t('admin.col.title')} *</label>
              <input
                id="s-title"
                className={`form-input ${errors.title ? 'border-red-400' : ''}`}
                placeholder="e.g. Walking by Faith — Sunday Message"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              />
              {errors.title
                ? <p className="form-error">{errors.title}</p>
                : <p className="text-gray-400 text-xs mt-1">{t('admin.sermon.titleHint')}</p>
              }
            </div>

            <div>
              <label className="form-label" htmlFor="s-speaker">{t('admin.sermon.speaker')}</label>
              <input id="s-speaker" className="form-input" placeholder="e.g. Bro. Raj Prakash Paul" {...f('speaker')} />
            </div>

            <div>
              <label className="form-label" htmlFor="s-date">{t('admin.form.date')}</label>
              <input id="s-date" type="date" className="form-input" {...f('sermonDate')} />
            </div>

            <div className="md:col-span-2">
              <label className="form-label" htmlFor="s-video">{t('admin.sermon.videoUrl')}</label>
              <input
                id="s-video"
                className="form-input"
                placeholder="https://youtube.com/watch?v=XXXXXXXXXXX"
                value={form.videoUrl}
                onChange={e => handleVideoUrl(e.target.value)}
              />
              <p className="text-gray-400 text-xs mt-1">{t('admin.sermon.urlHint')}</p>
            </div>

            {thumbPreview && (
              <div className="md:col-span-2">
                <p className="form-label">{t('admin.sermon.thumbPreview')}</p>
                <img
                  src={thumbPreview}
                  alt={t('admin.sermon.thumbPreview')}
                  className="h-32 rounded-xl object-cover border border-church-border"
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            )}

            <div>
              <label className="form-label" htmlFor="s-duration">{t('admin.sermon.duration')}</label>
              <input id="s-duration" className="form-input" placeholder="e.g. 45:00 or 1hr 20min" {...f('duration')} />
            </div>

            <div>
              <label className="form-label" htmlFor="s-audio">{t('admin.sermon.audioUrl')}</label>
              <input id="s-audio" className="form-input" placeholder="https://..." {...f('audioUrl')} />
            </div>

            <div className="md:col-span-2">
              <label className="form-label" htmlFor="s-desc">{t('admin.form.description')} ({t('common.optional')})</label>
              <textarea
                id="s-desc"
                rows={3}
                className="form-input resize-none"
                placeholder="Brief description of the sermon topic…"
                {...f('description')}
              />
            </div>

            <div className="md:col-span-2">
              <label className="form-label" htmlFor="s-thumb">{t('admin.sermon.customThumb')}</label>
              <input
                id="s-thumb"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="form-input py-2 cursor-pointer"
                onChange={handleThumbFile}
              />
              <p className="text-gray-400 text-xs mt-1">{t('admin.sermon.customThumbHint')}</p>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`relative w-10 h-5 rounded-full transition-colors ${form.published ? 'bg-church-blue' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.published ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={form.published}
                  onChange={e => setForm(p => ({ ...p, published: e.target.checked }))}
                />
                <span className="text-sm font-medium text-gray-700">
                  {form.published ? t('admin.sermon.publishedOn') : t('admin.sermon.draftOff')}
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
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
