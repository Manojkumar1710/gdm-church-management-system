import { useEffect, useState } from 'react';
import { sermonService } from '../services/sermonService';
import AdminTable from './components/AdminTable';
import Pagination from './components/Pagination';
import ConfirmDialog from './components/ConfirmDialog';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { getYoutubeId, getYoutubeThumbnail } from '../utils/youtube';

const EMPTY = {
  title: '', description: '', speaker: '', sermonDate: '',
  videoUrl: '', audioUrl: '', duration: '', published: false,
};

export default function AdminSermonsPage() {
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
    if (!form.title.trim()) e.title = 'Sermon title is required';
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
      toast.success(editing ? 'Sermon updated' : 'Sermon created');
      setModal(false);
      load(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleThumbFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbFile(file);
    setThumbPreview(URL.createObjectURL(file));
  };

  // Auto-preview YouTube thumbnail when URL is typed
  const handleVideoUrl = (url) => {
    setForm(p => ({ ...p, videoUrl: url }));
    if (!thumbFile) {
      const ytThumb = getYoutubeThumbnail(url);
      setThumbPreview(ytThumb || null);
    }
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try { await sermonService.delete(deleting.id); toast.success('Sermon deleted'); setDeleting(null); load(page); }
    catch { toast.error('Delete failed'); } finally { setDeleteLoading(false); }
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  const cols = [
    {
      key: 'thumbnailUrl', label: 'Thumb',
      render: r => {
        const thumb = r.thumbnailUrl || getYoutubeThumbnail(r.videoUrl);
        return thumb
          ? <img src={thumb} alt={r.title} className="h-10 w-16 rounded-lg object-cover border border-gray-100" onError={e => e.currentTarget.style.display='none'} />
          : <div className="h-10 w-16 rounded-lg bg-church-blue/10 flex items-center justify-center text-lg">📖</div>;
      },
    },
    { key: 'title',   label: 'Title' },
    { key: 'speaker', label: 'Speaker' },
    { key: 'sermonDate', label: 'Date' },
    {
      key: 'published', label: 'Status',
      render: r => <span className={`badge ${r.published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
        {r.published ? '✓ Published' : '○ Draft'}
      </span>,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-church-blue" style={{ fontFamily: 'Lora, serif' }}>Sermons</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage sermon records and YouTube videos</p>
        </div>
        <button onClick={openCreate} className="btn-primary">+ Add Sermon</button>
      </div>

      <AdminTable columns={cols} rows={rows} loading={loading} onEdit={openEdit} onDelete={setDeleting} />
      <Pagination page={page} totalPages={totalPages} onPageChange={load} />

      {/* ── Form modal ── */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Sermon' : 'Add Sermon'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Title — full width, clear placeholder */}
            <div className="md:col-span-2">
              <label className="form-label">Sermon Title *</label>
              <input
                className={`form-input ${errors.title ? 'border-red-400' : ''}`}
                placeholder="e.g. Walking by Faith — Sunday Message"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              />
              {errors.title
                ? <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                : <p className="text-gray-400 text-xs mt-1">Type the sermon title — not the YouTube URL</p>
              }
            </div>

            {/* Speaker */}
            <div>
              <label className="form-label">Speaker / Pastor</label>
              <input className="form-input" placeholder="e.g. Bro. Raj Prakash Paul" {...f('speaker')} />
            </div>

            {/* Date */}
            <div>
              <label className="form-label">Sermon Date</label>
              <input type="date" className="form-input" {...f('sermonDate')} />
            </div>

            {/* YouTube URL — full width */}
            <div className="md:col-span-2">
              <label className="form-label">YouTube / Video URL</label>
              <input
                className="form-input"
                placeholder="https://youtube.com/watch?v=XXXXXXXXXXX"
                value={form.videoUrl}
                onChange={e => handleVideoUrl(e.target.value)}
              />
              <p className="text-gray-400 text-xs mt-1">
                Paste the full YouTube link here. The thumbnail will auto-load below.
              </p>
            </div>

            {/* Thumbnail preview (auto from YouTube or uploaded) */}
            {thumbPreview && (
              <div className="md:col-span-2">
                <p className="form-label">Thumbnail Preview</p>
                <img
                  src={thumbPreview}
                  alt="thumbnail"
                  className="h-32 rounded-xl object-cover border border-gray-200"
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            )}

            {/* Duration */}
            <div>
              <label className="form-label">Duration</label>
              <input className="form-input" placeholder="e.g. 45:00 or 1hr 20min" {...f('duration')} />
            </div>

            {/* Audio URL */}
            <div>
              <label className="form-label">Audio URL (optional)</label>
              <input className="form-input" placeholder="https://..." {...f('audioUrl')} />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="form-label">Description (optional)</label>
              <textarea
                rows={3}
                className="form-input resize-none"
                placeholder="Brief description of the sermon topic…"
                {...f('description')}
              />
            </div>

            {/* Thumbnail upload (overrides YouTube auto-thumb) */}
            <div className="md:col-span-2">
              <label className="form-label">Upload Custom Thumbnail (optional)</label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="form-input py-2 cursor-pointer"
                onChange={handleThumbFile}
              />
              <p className="text-gray-400 text-xs mt-1">
                Leave empty to use the YouTube thumbnail automatically.
              </p>
            </div>

            {/* Published */}
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
                  {form.published ? '✓ Published — visible on website' : '○ Draft — not visible yet'}
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary py-2 px-5 text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary py-2 px-5 text-sm">
              {saving ? 'Saving…' : editing ? 'Update Sermon' : 'Create Sermon'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete Sermon"
        message={`Delete "${deleting?.title}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
