import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { sundaySchoolService } from '../services/sundaySchoolService';
import { useAuth } from '../context/AuthContext';
import AdminTable from './components/AdminTable';
import Pagination from './components/Pagination';
import ConfirmDialog from './components/ConfirmDialog';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';
import { MagnifyingGlassIcon, LockClosedIcon } from '@heroicons/react/24/outline';

function ChildrenTab() {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();

  const [rows,          setRows]          = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [page,          setPage]          = useState(0);
  const [totalPages,    setTotalPages]    = useState(0);
  const [search,        setSearch]        = useState('');
  const [classFilter,   setClassFilter]   = useState('');

  const [modal,        setModal]        = useState(false);
  const [form,         setForm]         = useState(emptyChild());
  const [editing,      setEditing]      = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [errors,       setErrors]       = useState({});

  const [deleting,      setDeleting]      = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [deactivating,      setDeactivating]      = useState(null);
  const [deactivateLoading, setDeactivateLoading] = useState(false);

  const entity = t('admin.entity.child');

  function emptyChild() {
    return { name: '', dateOfBirth: '', village: '', parentName: '', parentContact: '', classGroup: '', active: true };
  }

  const load = (p = 0) => {
    setLoading(true);
    sundaySchoolService.listChildren(p, 20)
      .then(r => {
        const d = r.data.data;
        setRows(d.content);
        setTotalPages(d.totalPages);
        setPage(p);
      })
      .catch(() => toast.error(t('admin.ss.loadFail')))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(0), []);

  const displayed = useMemo(() => {
    let data = rows;
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(r =>
        r.name?.toLowerCase().includes(q) ||
        r.parentName?.toLowerCase().includes(q) ||
        r.village?.toLowerCase().includes(q)
      );
    }
    if (classFilter) {
      data = data.filter(r => r.classGroup === classFilter);
    }
    return data;
  }, [rows, search, classFilter]);

  const classGroups = useMemo(() =>
    [...new Set(rows.map(r => r.classGroup).filter(Boolean))].sort()
  , [rows]);

  const filtered = !!(search || classFilter);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyChild());
    setErrors({});
    setModal(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      name:         row.name          || '',
      dateOfBirth:  row.dateOfBirth   || '',
      village:      row.village       || '',
      parentName:   row.parentName    || '',
      parentContact:row.parentContact || '',
      classGroup:   row.classGroup    || '',
      active:       row.active,
    });
    setErrors({});
    setModal(true);
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
      if (editing) {
        await sundaySchoolService.updateChild(editing.id, form);
        toast.success(t('admin.toast.updated', { entity }));
      } else {
        await sundaySchoolService.createChild(form);
        toast.success(t('admin.toast.created', { entity }));
      }
      setModal(false);
      load(page);
    } catch (err) {
      toast.error(err.response?.data?.message || t('admin.ss.saveFail'));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await sundaySchoolService.deleteChild(deleting.id);
      toast.success(t('admin.toast.deleted', { entity }));
      setDeleting(null);
      load(page);
    } catch {
      toast.error(t('admin.toast.deleteFailed'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const confirmDeactivate = async () => {
    setDeactivateLoading(true);
    try {
      await sundaySchoolService.deactivateChild(deactivating.id);
      toast.success(t('admin.ss.deactivated', { name: deactivating.name }));
      setDeactivating(null);
      load(page);
    } catch {
      toast.error(t('admin.ss.deactivateFail'));
    } finally {
      setDeactivateLoading(false);
    }
  };

  const f = (key) => ({
    value: form[key],
    onChange: e => setForm(p => ({ ...p, [key]: e.target.value })),
  });

  const cols = [
    { key: 'name',         label: t('admin.col.name') },
    { key: 'dateOfBirth',  label: t('admin.ss.dob'), render: r => r.dateOfBirth || '—' },
    { key: 'village',      label: t('admin.col.village'), render: r => r.village || '—' },
    { key: 'classGroup',   label: t('admin.ss.classGroup'), render: r => r.classGroup || '—' },
    { key: 'parentName',   label: t('admin.ss.parentName'), render: r => r.parentName || '—' },
    { key: 'parentContact',label: t('admin.ss.parentContact'), render: r => r.parentContact || '—' },
    {
      key: 'active', label: t('admin.col.status'),
      render: r => (
        <span className={`pill ${r.active ? 'pill--success' : 'pill--danger'}`}>
          {r.active ? t('admin.status.YES') : t('admin.pastor.inactive')}
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="page-header">
        <p className="page-subtitle">{t('admin.ss.privateNotice')}</p>
        <button onClick={openCreate} className="btn-primary btn-sm shrink-0">+ {t('admin.action.add', { entity })}</button>
      </div>

      <div className="admin-toolbar">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <label className="sr-only" htmlFor="ss-search">{t('common.search')}</label>
          <input
            id="ss-search"
            className="form-input pl-9"
            placeholder={t('admin.ss.searchByName')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {classGroups.length > 0 && (
          <>
            <label className="sr-only" htmlFor="ss-class">{t('admin.ss.allClasses')}</label>
            <select
              id="ss-class"
              className="inline-select"
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
            >
              <option value="">{t('admin.ss.allClasses')}</option>
              {classGroups.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </>
        )}

        {filtered && (
          <button
            type="button"
            onClick={() => { setSearch(''); setClassFilter(''); }}
            className="btn-ghost btn-sm"
          >
            {t('admin.action.clearFilters')}
          </button>
        )}

        <span className="text-sm text-gray-400 self-center">
          {t(filtered && rows.length !== displayed.length ? 'admin.ss.ofTotal' : displayed.length === 1 ? 'admin.ss.countChild' : 'admin.ss.countChildren', filtered && rows.length !== displayed.length ? { count: displayed.length, total: rows.length } : { count: displayed.length })}
        </span>
      </div>

      <AdminTable
        columns={cols}
        rows={displayed}
        loading={loading}
        onEdit={openEdit}
        actions={row => (
          <div className="flex items-center gap-1.5">
            {row.active && (
              <button
                type="button"
                onClick={() => setDeactivating(row)}
                className="admin-btn"
                title={t('admin.ss.markInactive')}
              >
                {t('admin.ss.deactivate')}
              </button>
            )}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setDeleting(row)}
                className="admin-btn admin-btn--danger"
              >
                {t('common.delete')}
              </button>
            )}
          </div>
        )}
        emptyMessage={filtered ? t('admin.empty.noResults') : t('admin.empty.children')}
      />
      <Pagination page={page} totalPages={totalPages} onPageChange={load} />

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? t('admin.action.edit', { entity }) : t('admin.action.add', { entity })}
        size="lg"
      >
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="form-label" htmlFor="c-name">{t('admin.ss.fullName')} *</label>
              <input
                id="c-name"
                className={`form-input ${errors.name ? 'border-red-400' : ''}`}
                placeholder="Child's full name"
                {...f('name')}
              />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>

            <div>
              <label className="form-label" htmlFor="c-dob">{t('admin.ss.dob')}</label>
              <input id="c-dob" type="date" className="form-input" {...f('dateOfBirth')} />
            </div>

            <div>
              <label className="form-label" htmlFor="c-village">{t('admin.col.village')}</label>
              <input id="c-village" className="form-input" placeholder="e.g. Yerramalla" {...f('village')} />
            </div>

            <div>
              <label className="form-label" htmlFor="c-class">{t('admin.ss.classGroup')}</label>
              <input
                id="c-class"
                className="form-input"
                placeholder="e.g. Nursery, Primary, Junior…"
                {...f('classGroup')}
              />
            </div>

            <div>
              <label className="form-label" htmlFor="c-parent">{t('admin.ss.parentName')}</label>
              <input id="c-parent" className="form-input" placeholder="Parent's full name" {...f('parentName')} />
            </div>

            <div>
              <label className="form-label" htmlFor="c-contact">{t('admin.ss.parentContact')}</label>
              <input id="c-contact" className="form-input" placeholder="+91-9XXXXXXXXX" {...f('parentContact')} />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`relative w-10 h-5 rounded-full transition-colors ${form.active ? 'bg-church-blue' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.active ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={form.active}
                  onChange={e => setForm(p => ({ ...p, active: e.target.checked }))}
                />
                <span className="text-sm font-medium text-gray-700">
                  {form.active ? t('admin.ss.activeOn') : t('admin.ss.activeOff')}
                </span>
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

      <ConfirmDialog
        open={!!deactivating}
        title={t('admin.ss.deactivateTitle')}
        message={t('admin.ss.deactivateMsg', { name: deactivating?.name })}
        onConfirm={confirmDeactivate}
        onCancel={() => setDeactivating(null)}
        loading={deactivateLoading}
      />

      <ConfirmDialog
        open={!!deleting}
        title={t('admin.ss.deleteTitle')}
        message={t('admin.ss.deleteMsg', { name: deleting?.name })}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
        loading={deleteLoading}
      />
    </>
  );
}

function TeachersTab() {
  const { t } = useLanguage();
  const [rows,          setRows]          = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [page,          setPage]          = useState(0);
  const [totalPages,    setTotalPages]    = useState(0);
  const [modal,         setModal]         = useState(false);
  const [form,          setForm]          = useState({ name:'', village:'', contactNumber:'', email:'', classGroup:'', active:true, contactPublic:false });
  const [editing,       setEditing]       = useState(null);
  const [saving,        setSaving]        = useState(false);
  const [deleting,      setDeleting]      = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errors,        setErrors]        = useState({});

  const entity = t('admin.entity.teacher');

  const load = (p = 0) => {
    setLoading(true);
    sundaySchoolService.listTeachers(p, 20)
      .then(r => { const d = r.data.data; setRows(d.content); setTotalPages(d.totalPages); setPage(p); })
      .finally(() => setLoading(false));
  };

  useEffect(() => load(0), []);

  const openCreate = () => { setEditing(null); setForm({ name:'', village:'', contactNumber:'', email:'', classGroup:'', active:true, contactPublic:false }); setErrors({}); setModal(true); };
  const openEdit = (row) => { setEditing(row); setForm({ name: row.name, village: row.village||'', contactNumber: row.contactNumber||'', email: row.email||'', classGroup: row.classGroup||'', active: row.active, contactPublic: row.contactPublic }); setErrors({}); setModal(true); };

  const validate = () => { const e = {}; if (!form.name.trim()) e.name = t('admin.validate.nameRequired'); setErrors(e); return Object.keys(e).length === 0; };

  const save = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (editing) await sundaySchoolService.updateTeacher(editing.id, form);
      else await sundaySchoolService.createTeacher(form);
      toast.success(t(editing ? 'admin.toast.updated' : 'admin.toast.created', { entity }));
      setModal(false); load(page);
    } catch (err) { toast.error(err.response?.data?.message || t('admin.toast.saveFailed')); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try { await sundaySchoolService.deleteTeacher(deleting.id); toast.success(t('admin.toast.deleted', { entity })); setDeleting(null); load(page); }
    catch { toast.error(t('admin.toast.deleteFailed')); } finally { setDeleteLoading(false); }
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  const cols = [
    { key: 'name',          label: t('admin.col.name') },
    { key: 'village',       label: t('admin.col.village'), render: r => r.village || '—' },
    { key: 'classGroup',    label: t('admin.ss.classGroup'), render: r => r.classGroup || '—' },
    { key: 'contactNumber', label: t('admin.pastor.contactNumber'), render: r => r.contactNumber || '—' },
    { key: 'active', label: t('admin.col.status'), render: r => (
      <span className={`pill ${r.active ? 'pill--success' : 'pill--muted'}`}>
        {r.active ? t('admin.status.YES') : t('admin.pastor.inactive')}
      </span>
    ) },
  ];

  return (
    <>
      <div className="admin-toolbar justify-end">
        <button onClick={openCreate} className="btn-primary btn-sm">+ {t('admin.action.add', { entity })}</button>
      </div>
      <AdminTable columns={cols} rows={rows} loading={loading} onEdit={openEdit} onDelete={setDeleting}
        emptyMessage={t('admin.empty.teachers')} />
      <Pagination page={page} totalPages={totalPages} onPageChange={load} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? t('admin.action.edit', { entity }) : t('admin.action.add', { entity })} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label" htmlFor="t-name">{t('admin.form.name')} *</label>
              <input id="t-name" className={`form-input ${errors.name ? 'border-red-400' : ''}`} placeholder="Teacher's full name" {...f('name')} />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>
            <div><label className="form-label" htmlFor="t-village">{t('admin.col.village')}</label><input id="t-village" className="form-input" placeholder="e.g. Yerramalla" {...f('village')} /></div>
            <div><label className="form-label" htmlFor="t-contact">{t('admin.pastor.contactNumber')}</label><input id="t-contact" className="form-input" placeholder="+91-9XXXXXXXXX" {...f('contactNumber')} /></div>
            <div><label className="form-label" htmlFor="t-email">{t('admin.col.email')}</label><input id="t-email" type="email" className="form-input" placeholder="teacher@example.com" {...f('email')} /></div>
            <div className="md:col-span-2"><label className="form-label" htmlFor="t-class">{t('admin.ss.classGroup')}</label><input id="t-class" className="form-input" placeholder="e.g. Nursery, Primary…" {...f('classGroup')} /></div>
            <div className="md:col-span-2 flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="rounded" checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} />
                {t('admin.col.active')}
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="rounded" checked={form.contactPublic} onChange={e => setForm(p => ({ ...p, contactPublic: e.target.checked }))} />
                {t('admin.pastor.showContactPublic')}
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

      <ConfirmDialog open={!!deleting} title={t('admin.confirm.delete', { entity })}
        message={deleting?.name ? t('admin.confirm.deleteNamed', { name: deleting.name }) : t('admin.confirm.deleteGeneric')}
        onConfirm={confirmDelete} onCancel={() => setDeleting(null)} loading={deleteLoading} />
    </>
  );
}

function ProgramsTab() {
  const { t } = useLanguage();
  const [rows,          setRows]          = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [page,          setPage]          = useState(0);
  const [totalPages,    setTotalPages]    = useState(0);
  const [modal,         setModal]         = useState(false);
  const [form,          setForm]          = useState({ title:'', description:'', programDate:'', location:'', videoUrl:'', published:true });
  const [imageFile,     setImageFile]     = useState(null);
  const [editing,       setEditing]       = useState(null);
  const [saving,        setSaving]        = useState(false);
  const [deleting,      setDeleting]      = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errors,        setErrors]        = useState({});

  const entity = t('admin.entity.program');

  const load = (p = 0) => {
    setLoading(true);
    sundaySchoolService.listPrograms(p, 20)
      .then(r => { const d = r.data.data; setRows(d.content); setTotalPages(d.totalPages); setPage(p); })
      .finally(() => setLoading(false));
  };

  useEffect(() => load(0), []);

  const openCreate = () => { setEditing(null); setForm({ title:'', description:'', programDate:'', location:'', videoUrl:'', published:true }); setImageFile(null); setErrors({}); setModal(true); };
  const openEdit = (row) => { setEditing(row); setForm({ title: row.title, description: row.description||'', programDate: row.programDate||'', location: row.location||'', videoUrl: row.videoUrl||'', published: row.published }); setImageFile(null); setErrors({}); setModal(true); };

  const validate = () => { const e = {}; if (!form.title.trim()) e.title = t('admin.validate.titleRequired'); setErrors(e); return Object.keys(e).length === 0; };

  const save = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (editing) {
        await sundaySchoolService.updateProgram(editing.id, form);
      } else {
        const fd = new FormData();
        fd.append('title', form.title);
        if (form.description) fd.append('description', form.description);
        if (form.programDate) fd.append('programDate', form.programDate);
        if (form.location)    fd.append('location', form.location);
        if (form.videoUrl)    fd.append('videoUrl', form.videoUrl);
        if (imageFile)        fd.append('file', imageFile);
        await sundaySchoolService.createProgram(fd);
      }
      toast.success(t(editing ? 'admin.toast.updated' : 'admin.toast.created', { entity }));
      setModal(false); load(page);
    } catch (err) { toast.error(err.response?.data?.message || t('admin.toast.saveFailed')); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try { await sundaySchoolService.deleteProgram(deleting.id); toast.success(t('admin.toast.deleted', { entity })); setDeleting(null); load(page); }
    catch { toast.error(t('admin.toast.deleteFailed')); } finally { setDeleteLoading(false); }
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  const cols = [
    { key: 'title',       label: t('admin.col.title') },
    { key: 'programDate', label: t('admin.ss.programDate'), render: r => r.programDate || '—' },
    { key: 'location',    label: t('admin.col.location'), render: r => r.location || '—' },
    { key: 'published', label: t('admin.col.status'), render: r => (
      <span className={`pill ${r.published ? 'pill--success' : 'pill--muted'}`}>
        {r.published ? t('admin.sermon.published') : t('admin.sermon.draft')}
      </span>
    ) },
  ];

  return (
    <>
      <div className="admin-toolbar justify-end">
        <button onClick={openCreate} className="btn-primary btn-sm">+ {t('admin.action.add', { entity })}</button>
      </div>
      <AdminTable columns={cols} rows={rows} loading={loading} onEdit={openEdit} onDelete={setDeleting}
        emptyMessage={t('admin.empty.programs')} />
      <Pagination page={page} totalPages={totalPages} onPageChange={load} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? t('admin.action.edit', { entity }) : t('admin.action.add', { entity })} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="form-label" htmlFor="pg-title">{t('admin.col.title')} *</label>
            <input id="pg-title" className={`form-input ${errors.title ? 'border-red-400' : ''}`} placeholder="Program title" {...f('title')} />
            {errors.title && <p className="form-error">{errors.title}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="form-label" htmlFor="pg-date">{t('admin.ss.programDate')}</label><input id="pg-date" type="date" className="form-input" {...f('programDate')} /></div>
            <div><label className="form-label" htmlFor="pg-loc">{t('admin.col.location')}</label><input id="pg-loc" className="form-input" placeholder="Venue" {...f('location')} /></div>
          </div>
          <div><label className="form-label" htmlFor="pg-desc">{t('admin.form.description')}</label><textarea id="pg-desc" rows={3} className="form-input resize-none" {...f('description')} /></div>
          <div><label className="form-label" htmlFor="pg-video">{t('admin.ss.videoUrl')}</label><input id="pg-video" className="form-input" placeholder="https://youtube.com/…" {...f('videoUrl')} /></div>
          {!editing && (
            <div>
              <label className="form-label" htmlFor="pg-img">{t('admin.ss.imageOptional')}</label>
              <input id="pg-img" type="file" accept="image/jpeg,image/png,image/webp" className="form-input py-2" onChange={e => setImageFile(e.target.files[0])} />
            </div>
          )}
          <div className="flex items-center gap-2">
            <input type="checkbox" id="ppub" className="rounded" checked={form.published} onChange={e => setForm(p => ({ ...p, published: e.target.checked }))} />
            <label htmlFor="ppub" className="text-sm text-gray-700">{t('admin.sermon.publishedOn')}</label>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary btn-sm">{t('common.cancel')}</button>
            <button type="submit" disabled={saving} className="btn-primary btn-sm">
              {saving ? t('admin.action.saving') : editing ? t('admin.action.update', { entity }) : t('admin.action.create', { entity })}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleting} title={t('admin.confirm.delete', { entity })}
        message={deleting?.title ? t('admin.confirm.deleteNamed', { name: deleting.title }) : t('admin.confirm.deleteGeneric')}
        onConfirm={confirmDelete} onCancel={() => setDeleting(null)} loading={deleteLoading} />
    </>
  );
}

export default function AdminSundaySchoolPage() {
  const { section = 'children' } = useParams();
  const { isAdmin, isTeacher } = useAuth();
  const { t } = useLanguage();

  const TABS = [
    { key: 'children', label: t('admin.ss.tabChildren'), path: '/admin/sunday-school/children' },
    { key: 'teachers', label: t('admin.ss.tabTeachers'), path: '/admin/sunday-school/teachers' },
    { key: 'programs', label: t('admin.ss.tabPrograms'), path: '/admin/sunday-school/programs' },
  ];

  const visibleTabs = isTeacher && !isAdmin
    ? TABS.filter(tab => tab.key === 'children')
    : TABS;

  const Restricted = ({ message }) => (
    <div className="empty-state">
      <LockClosedIcon className="empty-state__icon" />
      <p className="empty-state__title">{message}</p>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <p className="page-subtitle">{t('admin.pageDesc.sundaySchool')}</p>
      </div>

      <div className="flex gap-1 mb-6 bg-church-light p-1 rounded-xl w-fit border border-church-border">
        {visibleTabs.map(tab => (
          <Link
            key={tab.key}
            to={tab.path}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              section === tab.key
                ? 'bg-white text-church-blue shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {section === 'children' && <ChildrenTab />}
      {section === 'teachers' && (isAdmin ? <TeachersTab /> : <Restricted message={t('admin.ss.teachersOnly')} />)}
      {section === 'programs' && (isAdmin ? <ProgramsTab /> : <Restricted message={t('admin.ss.programsOnly')} />)}
    </div>
  );
}
