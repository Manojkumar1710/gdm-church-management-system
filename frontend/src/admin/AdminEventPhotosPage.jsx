import { useEffect, useState, useRef, useCallback } from 'react';
import { eventService } from '../services/eventService';
import AdminTable from './components/AdminTable';
import Pagination from './components/Pagination';
import ConfirmDialog from './components/ConfirmDialog';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';
import { PhotoIcon, CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function AdminEventPhotosPage() {
  const { t, dateLocale } = useLanguage();
  const [events,      setEvents]      = useState([]);
  const [photos,      setPhotos]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [page,        setPage]        = useState(0);
  const [totalPages,  setTotalPages]  = useState(0);
  const [filterEventId, setFilter]    = useState('');

  const [uploadModal, setUploadModal] = useState(false);
  const [uploadEventId, setUploadEventId] = useState('');
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadMeta,  setUploadMeta]  = useState({ title: '', description: '', location: '' });
  const [previews,    setPreviews]    = useState([]);
  const [uploading,   setUploading]   = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver,    setDragOver]    = useState(false);
  const fileRef = useRef();

  const [deleting,      setDeleting]     = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const entity = t('admin.entity.photo');

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

  const addFiles = useCallback((newFiles) => {
    const valid = newFiles.filter(f =>
      ['image/jpeg','image/jpg','image/png','image/webp'].includes(f.type.toLowerCase())
    );
    if (valid.length !== newFiles.length) {
      toast.error(t('admin.photo.skippedFiles'));
    }
    setUploadFiles(prev => [...prev, ...valid]);
    setPreviews(prev => [...prev, ...valid.map(f => URL.createObjectURL(f))]);
  }, [t]);

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

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadEventId)         { toast.error(t('admin.photo.selectEvent')); return; }
    if (uploadFiles.length === 0) { toast.error(t('admin.photo.chooseImage')); return; }

    setUploading(true);
    setUploadProgress(0);

    let done = 0;
    const errors = [];

    for (const file of uploadFiles) {
      try {
        await eventService.uploadPhotos(Number(uploadEventId), [file], uploadMeta);
        done++;
        setUploadProgress(Math.round((done / uploadFiles.length) * 100));
      } catch (err) {
        const msg = err.response?.data?.message || err.message || t('admin.photo.uploadFailed');
        errors.push(`${file.name}: ${msg}`);
      }
    }

    setUploading(false);
    setUploadProgress(0);

    if (errors.length > 0) {
      toast.error(t('admin.photo.filesFailed', { count: errors.length, first: errors[0] }), { duration: 5000 });
    }
    if (done > 0) {
      toast.success(t('admin.photo.uploadedCount', { count: done }));
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

  const togglePublish = async (photo) => {
    try {
      await eventService.updatePhoto(photo.id, { ...photo, published: !photo.published });
      toast.success(photo.published ? t('admin.photo.unpublishedToast') : t('admin.photo.publishedToast'));
      loadPhotos(page);
    } catch { toast.error(t('admin.toast.updateFailed')); }
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await eventService.deletePhoto(deleting.id);
      toast.success(t('admin.toast.deleted', { entity }));
      setDeleting(null);
      loadPhotos(page);
    } catch { toast.error(t('admin.toast.deleteFailed')); } finally { setDeleteLoading(false); }
  };

  const cols = [
    {
      key: 'imageUrl', label: t('admin.photo.photo'),
      render: r => r.imageUrl
        ? <img src={r.imageUrl} alt={r.title || t('admin.photo.photo')} className="h-12 w-16 rounded-lg object-cover border border-church-border" />
        : <div className="h-12 w-16 rounded-lg bg-church-light flex items-center justify-center"><PhotoIcon className="h-5 w-5 text-gray-300" /></div>,
    },
    { key: 'eventTitle', label: t('admin.nav.events') },
    { key: 'title',      label: t('admin.photo.caption'), render: r => r.title || '—' },
    {
      key: 'published', label: t('admin.col.status'),
      render: r => <span className={`pill ${r.published ? 'pill--success' : 'pill--warn'}`}>
        {r.published ? t('admin.sermon.published') : t('admin.photo.hidden')}
      </span>,
    },
    {
      key: 'createdAt', label: t('admin.col.added'),
      render: r => r.createdAt ? new Date(r.createdAt).toLocaleDateString(dateLocale, { day:'numeric', month:'short', year:'numeric' }) : '—',
    },
  ];

  return (
    <div>
      <div className="page-header">
        <p className="page-subtitle">{t('admin.pageDesc.eventPhotos')}</p>
        <button onClick={() => setUploadModal(true)} className="btn-primary btn-sm">
          <CloudArrowUpIcon className="h-4 w-4" />
          {t('admin.action.upload', { entity })}
        </button>
      </div>

      <div className="admin-toolbar">
        <label className="sr-only" htmlFor="photo-filter">{t('admin.filter.all')}</label>
        <select
          id="photo-filter"
          className="inline-select"
          value={filterEventId}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="">{t('admin.photo.allEvents')}</option>
          {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
        </select>
        {filterEventId && (
          <button onClick={() => setFilter('')} className="btn-ghost btn-sm">
            <XMarkIcon className="h-3 w-3" /> {t('admin.action.clearFilters')}
          </button>
        )}
      </div>

      <AdminTable
        columns={cols} rows={photos} loading={loading}
        onDelete={setDeleting}
        actions={row => (
          <button
            type="button"
            onClick={() => togglePublish(row)}
            className={row.published ? 'admin-btn' : 'admin-btn admin-btn--gold'}
          >
            {row.published ? t('admin.photo.unpublish') : t('admin.photo.publish')}
          </button>
        )}
        emptyMessage={t('admin.empty.photos')}
      />
      <Pagination page={page} totalPages={totalPages} onPageChange={loadPhotos} />

      <Modal
        open={uploadModal}
        onClose={() => !uploading && resetUpload()}
        title={t('admin.photo.uploadTitle')}
        size="lg"
      >
        <form onSubmit={handleUpload} className="space-y-5">

          <div>
            <label className="form-label" htmlFor="up-event">{t('admin.form.event')} *</label>
            <select
              id="up-event"
              className="form-input"
              value={uploadEventId}
              onChange={e => setUploadEventId(e.target.value)}
              required
            >
              <option value="">{t('admin.form.selectPlaceholder')}</option>
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
            </select>
          </div>

          <div>
            <span className="form-label">{t('admin.photo.imagesLabel')}</span>
            <div
              onDrop={onDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                dragOver
                  ? 'border-church-blue bg-church-blue/5'
                  : 'border-church-border hover:border-church-blue hover:bg-church-light'
              }`}
            >
              <CloudArrowUpIcon className={`h-10 w-10 mx-auto mb-2 ${dragOver ? 'text-church-blue' : 'text-gray-300'}`} />
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-church-blue">{t('admin.photo.clickToChoose')}</span> {t('admin.photo.orDragDrop')}
              </p>
              <p className="text-xs text-gray-400 mt-1">{t('admin.photo.multipleAllowed')}</p>
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

          {previews.length > 0 && (
            <div>
              <p className="form-label">{t('admin.photo.filesSelected', { count: previews.length })}</p>
              <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto p-1">
                {previews.map((src, i) => (
                  <div key={i} className="relative group">
                    <img src={src} alt={t('admin.form.image')} className="h-20 w-20 rounded-xl object-cover border border-church-border" />
                    <button
                      type="button"
                      onClick={() => removePreview(i)}
                      aria-label={t('common.close')}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploading && (
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{t('admin.photo.uploading')}</span>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label" htmlFor="up-caption">{t('admin.photo.captionAll')}</label>
              <input
                id="up-caption"
                className="form-input"
                value={uploadMeta.title}
                onChange={e => setUploadMeta(m => ({ ...m, title: e.target.value }))}
                placeholder="e.g. Easter Sunday 2026"
              />
            </div>
            <div>
              <label className="form-label" htmlFor="up-loc">{t('admin.photo.locationOptional')}</label>
              <input
                id="up-loc"
                className="form-input"
                value={uploadMeta.location}
                onChange={e => setUploadMeta(m => ({ ...m, location: e.target.value }))}
                placeholder="Church hall, etc."
              />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label" htmlFor="up-desc">{t('admin.form.description')} ({t('common.optional')})</label>
              <textarea
                id="up-desc"
                rows={2}
                className="form-input resize-none"
                value={uploadMeta.description}
                onChange={e => setUploadMeta(m => ({ ...m, description: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => !uploading && resetUpload()}
              disabled={uploading}
              className="btn-secondary btn-sm"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={uploading || uploadFiles.length === 0}
              className="btn-primary btn-sm"
            >
              {uploading
                ? `${t('admin.photo.uploading')} ${uploadProgress}%`
                : uploadFiles.length > 0
                  ? t('admin.photo.uploadCount', { count: uploadFiles.length })
                  : t('admin.photo.uploadOne')
              }
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title={t('admin.confirm.delete', { entity })}
        message={t('admin.photo.deleteMessage')}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
