import { useEffect, useState, useRef, useCallback } from 'react';
import { eventService } from '../services/eventService';
import AdminTable from './components/AdminTable';
import Pagination from './components/Pagination';
import ConfirmDialog from './components/ConfirmDialog';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { PhotoIcon, CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function AdminEventPhotosPage() {
  const [events,      setEvents]      = useState([]);
  const [photos,      setPhotos]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [page,        setPage]        = useState(0);
  const [totalPages,  setTotalPages]  = useState(0);
  const [filterEventId, setFilter]    = useState('');

  // Upload state
  const [uploadModal, setUploadModal] = useState(false);
  const [uploadEventId, setUploadEventId] = useState('');
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadMeta,  setUploadMeta]  = useState({ title: '', description: '', location: '' });
  const [previews,    setPreviews]    = useState([]);
  const [uploading,   setUploading]   = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver,    setDragOver]    = useState(false);
  const fileRef = useRef();

  // Delete
  const [deleting,      setDeleting]     = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* ── Load photos ── */
  const loadPhotos = (p = 0) => {
    setLoading(true);
    eventService.adminListPhotos(filterEventId || null, p, 20)
      .then(r => {
        const d = r.data.data;
        setPhotos(d.content); setTotalPages(d.totalPages); setPage(p);
      }).finally(() => setLoading(false));
  };

  useEffect(() => {
    eventService.adminList(0, 100).then(r => setEvents(r.data.data?.content || []));
    loadPhotos(0);
  }, []);

  useEffect(() => { loadPhotos(0); }, [filterEventId]);

  /* ── File selection (input or drop) ── */
  const addFiles = useCallback((newFiles) => {
    const valid = newFiles.filter(f =>
      ['image/jpeg','image/jpg','image/png','image/webp'].includes(f.type.toLowerCase())
    );
    if (valid.length !== newFiles.length) {
      toast.error('Some files were skipped — only JPG, PNG and WebP are allowed');
    }
    setUploadFiles(prev => [...prev, ...valid]);
    setPreviews(prev => [...prev, ...valid.map(f => URL.createObjectURL(f))]);
  }, []);

  const handleFileChange = (e) => addFiles(Array.from(e.target.files));

  const removePreview = (i) => {
    setUploadFiles(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[i]);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const onDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  /* ── Upload ── */
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadEventId)         { toast.error('Please select an event');      return; }
    if (uploadFiles.length === 0) { toast.error('Please choose at least one image'); return; }

    setUploading(true);
    setUploadProgress(0);

    // Upload one at a time so we can show per-file progress
    let done = 0;
    const errors = [];

    for (const file of uploadFiles) {
      try {
        await eventService.uploadPhotos(Number(uploadEventId), [file], uploadMeta);
        done++;
        setUploadProgress(Math.round((done / uploadFiles.length) * 100));
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Upload failed';
        errors.push(`${file.name}: ${msg}`);
      }
    }

    setUploading(false);
    setUploadProgress(0);

    if (errors.length > 0) {
      toast.error(`${errors.length} file(s) failed:\n${errors[0]}`, { duration: 5000 });
    }
    if (done > 0) {
      toast.success(`${done} photo(s) uploaded successfully`);
      resetUpload();
      loadPhotos(0);
    }
  };

  const resetUpload = () => {
    previews.forEach(URL.revokeObjectURL);
    setUploadFiles([]);
    setPreviews([]);
    setUploadMeta({ title: '', description: '', location: '' });
    setUploadEventId('');
    setUploadModal(false);
  };

  /* ── Publish toggle ── */
  const togglePublish = async (photo) => {
    try {
      await eventService.updatePhoto(photo.id, { ...photo, published: !photo.published });
      toast.success(photo.published ? 'Unpublished' : 'Published');
      loadPhotos(page);
    } catch { toast.error('Update failed'); }
  };

  /* ── Delete ── */
  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await eventService.deletePhoto(deleting.id);
      toast.success('Photo deleted');
      setDeleting(null);
      loadPhotos(page);
    } catch { toast.error('Delete failed'); } finally { setDeleteLoading(false); }
  };

  /* ── Table columns ── */
  const cols = [
    {
      key: 'imageUrl', label: 'Photo',
      render: r => r.imageUrl
        ? <img src={r.imageUrl} alt={r.title || 'photo'} className="h-12 w-16 rounded-lg object-cover border border-gray-100" />
        : <div className="h-12 w-16 rounded-lg bg-gray-100 flex items-center justify-center"><PhotoIcon className="h-5 w-5 text-gray-300" /></div>,
    },
    { key: 'eventTitle', label: 'Event' },
    { key: 'title',      label: 'Caption' },
    {
      key: 'published', label: 'Status',
      render: r => <span className={`badge ${r.published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
        {r.published ? '✓ Published' : '○ Hidden'}
      </span>,
    },
    {
      key: 'createdAt', label: 'Uploaded',
      render: r => r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—',
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Event Photos</h1>
          <p className="page-subtitle">Upload and manage event photos</p>
        </div>
        <button
          onClick={() => setUploadModal(true)}
          className="btn-primary"
        >
          <CloudArrowUpIcon className="h-4 w-4" />
          Upload Photos
        </button>
      </div>

      {/* Filter */}
      <div className="mb-4 flex gap-3 flex-wrap items-center">
        <select
          className="form-input w-auto min-w-[220px]"
          value={filterEventId}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="">All Events</option>
          {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
        </select>
        {filterEventId && (
          <button onClick={() => setFilter('')} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <XMarkIcon className="h-3 w-3" /> Clear filter
          </button>
        )}
      </div>

      {/* Table */}
      <AdminTable
        columns={cols} rows={photos} loading={loading}
        onDelete={setDeleting}
        actions={row => (
          <button
            onClick={() => togglePublish(row)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              row.published
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            {row.published ? 'Unpublish' : 'Publish'}
          </button>
        )}
        emptyMessage="No photos yet. Click Upload Photos to add some."
      />
      <Pagination page={page} totalPages={totalPages} onPageChange={loadPhotos} />

      {/* ── Upload modal ── */}
      <Modal
        open={uploadModal}
        onClose={() => !uploading && resetUpload()}
        title="Upload Event Photos"
        size="lg"
      >
        <form onSubmit={handleUpload} className="space-y-5">

          {/* Event selector */}
          <div>
            <label className="form-label">Event *</label>
            <select
              className="form-input"
              value={uploadEventId}
              onChange={e => setUploadEventId(e.target.value)}
              required
            >
              <option value="">Select event…</option>
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
            </select>
          </div>

          {/* Drop zone */}
          <div>
            <label className="form-label">Images * (JPG, PNG, WebP — up to 10 MB each)</label>
            <div
              onDrop={onDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                dragOver
                  ? 'border-church-blue bg-church-blue/5'
                  : 'border-gray-200 hover:border-church-blue hover:bg-gray-50'
              }`}
            >
              <CloudArrowUpIcon className={`h-10 w-10 mx-auto mb-2 ${dragOver ? 'text-church-blue' : 'text-gray-300'}`} />
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-church-blue">Click to choose files</span> or drag and drop
              </p>
              <p className="text-xs text-gray-400 mt-1">Multiple images allowed</p>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Preview grid */}
          {previews.length > 0 && (
            <div>
              <p className="form-label">{previews.length} file(s) selected</p>
              <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto p-1">
                {previews.map((src, i) => (
                  <div key={i} className="relative group">
                    <img src={src} alt="preview" className="h-20 w-20 rounded-xl object-cover border border-gray-200" />
                    <button
                      type="button"
                      onClick={() => removePreview(i)}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload progress bar */}
          {uploading && (
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Uploading…</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-church-blue rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Caption (applied to all)</label>
              <input
                className="form-input"
                value={uploadMeta.title}
                onChange={e => setUploadMeta(m => ({ ...m, title: e.target.value }))}
                placeholder="e.g. Easter Sunday 2026"
              />
            </div>
            <div>
              <label className="form-label">Location (optional)</label>
              <input
                className="form-input"
                value={uploadMeta.location}
                onChange={e => setUploadMeta(m => ({ ...m, location: e.target.value }))}
                placeholder="Church hall, etc."
              />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Description (optional)</label>
              <textarea
                rows={2}
                className="form-input resize-none"
                value={uploadMeta.description}
                onChange={e => setUploadMeta(m => ({ ...m, description: e.target.value }))}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => !uploading && resetUpload()}
              disabled={uploading}
              className="btn-secondary py-2 px-5 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || uploadFiles.length === 0}
              className="btn-primary py-2 px-5 text-sm"
            >
              {uploading
                ? `Uploading ${uploadProgress}%…`
                : `Upload ${uploadFiles.length > 0 ? uploadFiles.length + ' Photo(s)' : ''}`
              }
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleting}
        title="Delete Photo"
        message="Delete this photo permanently? This cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
