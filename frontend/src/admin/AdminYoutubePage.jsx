import { useEffect, useState } from 'react';
import { youtubeService } from '../services/sermonService';
import AdminTable from './components/AdminTable';
import Pagination from './components/Pagination';
import ConfirmDialog from './components/ConfirmDialog';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const EMPTY = { title: '', description: '', youtubeUrl: '', thumbnailUrl: '', category: '', publishedDate: '', published: true };

export default function AdminYoutubePage() {
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
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.youtubeUrl.trim()) e.youtubeUrl = 'YouTube URL is required';
    else if (!/youtube\.com|youtu\.be/.test(form.youtubeUrl)) e.youtubeUrl = 'Must be a valid YouTube URL';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const save = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (editing) await youtubeService.update(editing.id, form);
      else await youtubeService.create(form);
      toast.success(editing ? 'Video updated' : 'Video added');
      setModal(false); load(page);
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try { await youtubeService.delete(deleting.id); toast.success('Video deleted'); setDeleting(null); load(page); }
    catch { toast.error('Delete failed'); } finally { setDeleteLoading(false); }
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  const cols = [
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category' },
    { key: 'publishedDate', label: 'Date' },
    { key: 'youtubeUrl', label: 'URL', render: r => <a href={r.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">Open ↗</a> },
    { key: 'published', label: 'Published', render: r => <span className={`badge ${r.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{r.published ? 'Yes' : 'No'}</span> },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-church-blue">YouTube Videos</h1>
          <p className="text-gray-500 text-sm">Manage YouTube links and metadata</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm py-2 px-4">+ Add Video</button>
      </div>

      <AdminTable columns={cols} rows={rows} loading={loading} onEdit={openEdit} onDelete={setDeleting} />
      <Pagination page={page} totalPages={totalPages} onPageChange={load} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Video' : 'Add YouTube Video'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="form-label">Title *</label>
            <input className={`form-input ${errors.title ? 'border-red-400' : ''}`} {...f('title')} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="form-label">YouTube URL *</label>
            <input className={`form-input ${errors.youtubeUrl ? 'border-red-400' : ''}`} {...f('youtubeUrl')} placeholder="https://youtube.com/watch?v=..." />
            {errors.youtubeUrl && <p className="text-red-500 text-xs mt-1">{errors.youtubeUrl}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Category</label>
              <input className="form-input" {...f('category')} placeholder="Sermon, Worship, Event…" />
            </div>
            <div>
              <label className="form-label">Published Date</label>
              <input type="date" className="form-input" {...f('publishedDate')} />
            </div>
          </div>
          <div>
            <label className="form-label">Thumbnail URL (optional)</label>
            <input className="form-input" {...f('thumbnailUrl')} placeholder="https://…" />
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea rows={3} className="form-input resize-none" {...f('description')} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="ypub" className="rounded" checked={form.published}
              onChange={e => setForm(p => ({ ...p, published: e.target.checked }))} />
            <label htmlFor="ypub" className="text-sm text-gray-700">Published</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary py-2 px-4 text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary py-2 px-4 text-sm">
              {saving ? 'Saving…' : editing ? 'Update' : 'Add Video'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleting} title="Delete Video"
        message={`Delete "${deleting?.title}"?`}
        onConfirm={confirmDelete} onCancel={() => setDeleting(null)} loading={deleteLoading} />
    </div>
  );
}
