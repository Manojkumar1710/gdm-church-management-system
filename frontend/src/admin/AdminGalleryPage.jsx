import { useEffect, useState } from 'react';
import { galleryService } from '../services/galleryService';
import AdminTable from './components/AdminTable';
import Pagination from './components/Pagination';
import ConfirmDialog from './components/ConfirmDialog';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

export default function AdminGalleryPage() {
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
    if (!editing && !imageFile) { setErrors({ image: 'Image is required' }); return; }
    setSaving(true);
    try {
      if (editing) {
        await galleryService.update(editing.id, form);
      } else {
        await galleryService.create(imageFile, form.title, form.description, form.category);
      }
      toast.success(editing ? 'Item updated' : 'Image added');
      setModal(false); load(page);
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try { await galleryService.delete(deleting.id); toast.success('Image deleted'); setDeleting(null); load(page); }
    catch { toast.error('Delete failed'); } finally { setDeleteLoading(false); }
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  const cols = [
    { key: 'imageUrl', label: 'Image', render: r => <img src={r.imageUrl} alt={r.title || 'gallery'} className="h-10 w-14 rounded object-cover" /> },
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category' },
    { key: 'published', label: 'Published', render: r => <span className={`badge ${r.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{r.published ? 'Yes' : 'No'}</span> },
    { key: 'createdAt', label: 'Added', render: r => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-church-blue">Gallery</h1>
          <p className="text-gray-500 text-sm">Manage church gallery images</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm py-2 px-4">+ Add Image</button>
      </div>

      <AdminTable columns={cols} rows={rows} loading={loading} onEdit={openEdit} onDelete={setDeleting} />
      <Pagination page={page} totalPages={totalPages} onPageChange={load} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Gallery Item' : 'Add Gallery Image'}>
        <form onSubmit={save} className="space-y-4">
          {!editing && (
            <div>
              <label className="form-label">Image *</label>
              <input type="file" accept="image/jpeg,image/png,image/webp" className={`form-input py-2 ${errors.image ? 'border-red-400' : ''}`}
                onChange={e => { setImageFile(e.target.files[0]); setErrors({}); }} />
              {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
            </div>
          )}
          <div>
            <label className="form-label">Title</label>
            <input className="form-input" {...f('title')} />
          </div>
          <div>
            <label className="form-label">Category</label>
            <input className="form-input" {...f('category')} placeholder="Worship, Events, Community…" />
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea rows={2} className="form-input resize-none" {...f('description')} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="gpub" className="rounded" checked={form.published}
              onChange={e => setForm(p => ({ ...p, published: e.target.checked }))} />
            <label htmlFor="gpub" className="text-sm text-gray-700">Published</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary py-2 px-4 text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary py-2 px-4 text-sm">
              {saving ? 'Saving…' : editing ? 'Update' : 'Add Image'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleting} title="Delete Image"
        message="Delete this gallery image? This cannot be undone."
        onConfirm={confirmDelete} onCancel={() => setDeleting(null)} loading={deleteLoading} />
    </div>
  );
}
