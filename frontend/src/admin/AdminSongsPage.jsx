import { useEffect, useRef, useState } from 'react';
import { songService } from '../services/songService';
import Modal from '../components/Modal';
import ConfirmDialog from './components/ConfirmDialog';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';
import {
  MusicalNoteIcon,
  ArrowUpTrayIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const EMPTY = {
  songNumber: '',
  titleTe: '',
  titleEn: '',
  lyricsTe: '',
  lyricsEn: '',
  category: '',
};

const SAMPLE_JSON = `[
  {
    "songNumber": 1,
    "titleTe": "నమూనా పాట",
    "titleEn": "Sample Song",
    "lyricsTe": "మొదటి వరుస\\nరెండవ వరుస",
    "lyricsEn": "First line\\nSecond line",
    "category": "General"
  }
]`;

export default function AdminSongsPage() {
  const { t } = useLanguage();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add-song modal
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Bulk import modal
  const [bulkModal, setBulkModal] = useState(false);
  const [bulkJson, setBulkJson] = useState('');
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkErrors, setBulkErrors] = useState([]);
  const [bulkServerError, setBulkServerError] = useState('');
  const fileInputRef = useRef(null);

  // Server error for add-song modal
  const [createServerError, setCreateServerError] = useState('');

  // Delete
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const entity = t('admin.entity.song');

  const load = () => {
    setLoading(true);
    songService
      .list()
      .then((r) => setSongs(r.data.data || []))
      .catch(() => setSongs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const openCreate = () => {
    setForm(EMPTY);
    setErrors({});
    setCreateServerError('');
    setModal(true);
  };

  const openBulk = () => {
    setBulkErrors([]);
    setBulkServerError('');
    setBulkModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.titleTe.trim()) e.titleTe = 'Telugu title is required';
    if (!form.titleEn.trim()) e.titleEn = 'English title is required';
    if (!form.lyricsTe.trim()) e.lyricsTe = 'Telugu lyrics are required';
    if (!form.lyricsEn.trim()) e.lyricsEn = 'English lyrics are required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setCreateServerError('');
    try {
      const payload = {
        ...form,
        songNumber: form.songNumber ? parseInt(form.songNumber, 10) : null,
      };
      await songService.create(payload);
      toast.success(t('admin.toast.created', { entity }));
      setModal(false);
      load();
    } catch (err) {
      const msg = err.response?.data?.message || t('admin.toast.saveFailed');
      setCreateServerError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleBulkImport = async () => {
    setBulkErrors([]);
    setBulkServerError('');

    let parsed;
    try {
      parsed = JSON.parse(bulkJson);
    } catch (err) {
      setBulkErrors(['Invalid JSON: ' + err.message]);
      return;
    }
    if (!Array.isArray(parsed)) {
      setBulkErrors(['JSON must be an array of songs']);
      return;
    }
    if (parsed.length === 0) {
      setBulkErrors(['Array must contain at least one song']);
      return;
    }

    // Client-side validation — check every song before sending
    const clientErrors = [];
    parsed.forEach((song, i) => {
      const label = `Song ${i + 1}${song.songNumber != null ? ' (number ' + song.songNumber + ')' : ''}`;
      if (!song.titleTe || !String(song.titleTe).trim()) clientErrors.push(`${label}: titleTe is required`);
      if (!song.titleEn || !String(song.titleEn).trim()) clientErrors.push(`${label}: titleEn is required`);
      if (!song.lyricsTe || !String(song.lyricsTe).trim()) clientErrors.push(`${label}: lyricsTe is required`);
      if (!song.lyricsEn || !String(song.lyricsEn).trim()) clientErrors.push(`${label}: lyricsEn is required`);
    });
    if (clientErrors.length > 0) {
      setBulkErrors(clientErrors);
      return;
    }

    setBulkSaving(true);
    try {
      const res = await songService.bulkCreate(parsed);
      toast.success(
        t('admin.toast.created', { entity: `${res.data.data.length} ${entity}` })
      );
      setBulkModal(false);
      setBulkJson('');
      setBulkErrors([]);
      setBulkServerError('');
      load();
    } catch (err) {
      const msg = err.response?.data?.message || t('admin.toast.saveFailed');
      setBulkServerError(msg);
      toast.error(msg);
    } finally {
      setBulkSaving(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setBulkJson(ev.target.result);
    reader.readAsText(file);
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await songService.delete(deleting.id);
      toast.success(t('admin.toast.deleted', { entity }));
      setDeleting(null);
      load();
    } catch {
      toast.error(t('admin.toast.deleteFailed'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const f = (key) => ({
    value: form[key],
    onChange: (e) => setForm((p) => ({ ...p, [key]: e.target.value })),
  });

  return (
    <div>
      <div className="page-header">
        <p className="page-subtitle">{t('admin.pageDesc.songs')}</p>
        <div className="flex gap-2">
          <button onClick={openBulk} className="btn-secondary btn-sm">
            <ArrowUpTrayIcon className="h-4 w-4" /> {t('songs.bulkImport')}
          </button>
          <button onClick={openCreate} className="btn-primary btn-sm">
            + {t('admin.action.add', { entity })}
          </button>
        </div>
      </div>

      {/* Song list */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-2xl" />
          ))}
        </div>
      ) : songs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">
            <MusicalNoteIcon className="h-6 w-6" />
          </div>
          <p className="empty-state__title">{t('songs.noSongs')}</p>
          <p className="empty-state__text">{t('songs.noSongsHint')}</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="w-16">#</th>
                <th>Telugu Title</th>
                <th>English Title</th>
                <th>Category</th>
                <th className="w-12" aria-label="actions" />
              </tr>
            </thead>
            <tbody>
              {songs.map((song) => (
                <tr key={song.id}>
                  <td className="align-middle font-semibold text-church-blue tabular-nums whitespace-nowrap">
                    {song.songNumber ?? '—'}
                  </td>
                  <td className="align-middle font-telugu leading-relaxed">{song.titleTe}</td>
                  <td className="align-middle leading-relaxed">{song.titleEn}</td>
                  <td className="align-middle">{song.category || 'General'}</td>
                  <td className="align-middle text-right">
                    <button
                      onClick={() => setDeleting(song)}
                      className="icon-btn text-red-500 hover:text-red-600"
                      aria-label={t('common.delete')}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Song Modal */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={t('admin.action.add', { entity })}
        size="lg"
      >
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label" htmlFor="s-num">
                Song Number
              </label>
              <input
                id="s-num"
                type="number"
                className="form-input"
                placeholder="e.g. 42"
                {...f('songNumber')}
              />
            </div>
            <div>
              <label className="form-label" htmlFor="s-cat">
                Category
              </label>
              <input
                id="s-cat"
                className="form-input"
                placeholder="General"
                {...f('category')}
              />
            </div>
            <div>
              <label className="form-label" htmlFor="s-te">
                Telugu Title *
              </label>
              <input
                id="s-te"
                className={`form-input font-telugu ${errors.titleTe ? 'border-red-400' : ''}`}
                placeholder="తెలుగు శీర్షిక"
                {...f('titleTe')}
              />
              {errors.titleTe && <p className="form-error">{errors.titleTe}</p>}
            </div>
            <div>
              <label className="form-label" htmlFor="s-en">
                English Title *
              </label>
              <input
                id="s-en"
                className={`form-input ${errors.titleEn ? 'border-red-400' : ''}`}
                placeholder="English Title"
                {...f('titleEn')}
              />
              {errors.titleEn && <p className="form-error">{errors.titleEn}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="form-label" htmlFor="s-ly-te">
                Telugu Lyrics *
              </label>
              <textarea
                id="s-ly-te"
                rows={6}
                className={`form-input font-telugu resize-y ${errors.lyricsTe ? 'border-red-400' : ''}`}
                placeholder="తెలుగు గేయం…"
                {...f('lyricsTe')}
              />
              {errors.lyricsTe && <p className="form-error">{errors.lyricsTe}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="form-label" htmlFor="s-ly-en">
                English Lyrics *
              </label>
              <textarea
                id="s-ly-en"
                rows={6}
                className={`form-input resize-y ${errors.lyricsEn ? 'border-red-400' : ''}`}
                placeholder="English lyrics…"
                {...f('lyricsEn')}
              />
              {errors.lyricsEn && <p className="form-error">{errors.lyricsEn}</p>}
            </div>
          </div>

          {createServerError && (
            <div className="admin-alert admin-alert--error">{createServerError}</div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setModal(false)}
              className="btn-secondary btn-sm"
            >
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={saving} className="btn-primary btn-sm">
              {saving
                ? t('admin.action.saving')
                : t('admin.action.create', { entity })}
            </button>
          </div>
        </form>
      </Modal>

      {/* Bulk Import Modal */}
      <Modal
        open={bulkModal}
        onClose={() => setBulkModal(false)}
        title={t('songs.bulkImport')}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="form-label">JSON Array of Songs</label>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="admin-btn"
              >
                <ArrowUpTrayIcon className="h-4 w-4" /> Upload .json
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
            <textarea
              rows={12}
              className="form-input resize-y font-mono text-xs"
              placeholder={SAMPLE_JSON}
              value={bulkJson}
              onChange={(e) => setBulkJson(e.target.value)}
            />
            <p className="text-gray-400 text-xs mt-1">
              Paste a JSON array or upload a .json file. Duplicate song numbers
              (within the file or already in the database) will be rejected
              with a 409 error listing the clashing numbers.
            </p>
          </div>

          {bulkErrors.length > 0 && (
            <div className="admin-alert admin-alert--error">
              <ul className="list-disc pl-4 space-y-0.5">
                {bulkErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
          {bulkServerError && (
            <div className="admin-alert admin-alert--error">{bulkServerError}</div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setBulkModal(false)}
              className="btn-secondary btn-sm"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              disabled={bulkSaving || !bulkJson.trim()}
              onClick={handleBulkImport}
              className="btn-primary btn-sm"
            >
              {bulkSaving ? t('admin.action.saving') : t('songs.import')}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title={t('admin.confirm.delete', { entity })}
        message={
          deleting?.titleTe
            ? `${deleting.titleTe} (${deleting.titleEn})`
            : t('admin.confirm.deleteGeneric')
        }
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
