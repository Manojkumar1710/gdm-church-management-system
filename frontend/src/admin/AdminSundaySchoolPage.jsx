import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { sundaySchoolService } from '../services/sundaySchoolService';
import { useAuth } from '../context/AuthContext';
import AdminTable from './components/AdminTable';
import Pagination from './components/Pagination';
import ConfirmDialog from './components/ConfirmDialog';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

/* ─────────────────────────────────────────────────────────────────
   CHILDREN TAB
   Accessible by: ADMIN, SUNDAY_SCHOOL_TEACHER
   ───────────────────────────────────────────────────────────────── */
function ChildrenTab() {
  const { isAdmin } = useAuth();

  const [rows,          setRows]          = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [page,          setPage]          = useState(0);
  const [totalPages,    setTotalPages]    = useState(0);
  const [search,        setSearch]        = useState('');
  const [classFilter,   setClassFilter]   = useState('');

  // Modal / form
  const [modal,        setModal]        = useState(false);
  const [form,         setForm]         = useState(emptyChild());
  const [editing,      setEditing]      = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [errors,       setErrors]       = useState({});

  // Delete confirm
  const [deleting,      setDeleting]      = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Deactivate confirm
  const [deactivating,      setDeactivating]      = useState(null);
  const [deactivateLoading, setDeactivateLoading] = useState(false);

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
      .catch(() => toast.error('Failed to load children'))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(0), []);

  // Client-side search/filter (sufficient for church-scale data)
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

  // Unique class groups for the filter dropdown
  const classGroups = useMemo(() =>
    [...new Set(rows.map(r => r.classGroup).filter(Boolean))].sort()
  , [rows]);

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
    if (!form.name.trim()) e.name = 'Name is required';
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
        toast.success('Child updated successfully');
      } else {
        await sundaySchoolService.createChild(form);
        toast.success('Child added successfully');
      }
      setModal(false);
      load(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await sundaySchoolService.deleteChild(deleting.id);
      toast.success('Child record deleted');
      setDeleting(null);
      load(page);
    } catch {
      toast.error('Delete failed. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const confirmDeactivate = async () => {
    setDeactivateLoading(true);
    try {
      await sundaySchoolService.deactivateChild(deactivating.id);
      toast.success(`${deactivating.name} has been deactivated`);
      setDeactivating(null);
      load(page);
    } catch {
      toast.error('Deactivate failed. Please try again.');
    } finally {
      setDeactivateLoading(false);
    }
  };

  const f = (key) => ({
    value: form[key],
    onChange: e => setForm(p => ({ ...p, [key]: e.target.value })),
  });

  const cols = [
    { key: 'name',         label: 'Name' },
    { key: 'dateOfBirth',  label: 'Date of Birth' },
    { key: 'village',      label: 'Village' },
    { key: 'classGroup',   label: 'Class / Group' },
    { key: 'parentName',   label: 'Parent / Guardian' },
    { key: 'parentContact',label: 'Parent Contact' },
    {
      key: 'active', label: 'Status',
      render: r => (
        <span className={`badge ${r.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
          {r.active ? '✓ Active' : '✗ Inactive'}
        </span>
      ),
    },
  ];

  return (
    <>
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          🔒 Children's records are private — never publicly visible.
        </div>
        <button onClick={openCreate} className="btn-primary shrink-0">
          + Add Child
        </button>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            className="form-input pl-9"
            placeholder="Search by name, parent or village…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {classGroups.length > 0 && (
          <select
            className="form-input w-auto min-w-[180px]"
            value={classFilter}
            onChange={e => setClassFilter(e.target.value)}
          >
            <option value="">All Classes</option>
            {classGroups.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        )}

        {(search || classFilter) && (
          <button
            onClick={() => { setSearch(''); setClassFilter(''); }}
            className="text-xs text-gray-500 hover:text-church-blue transition-colors px-2"
          >
            ✕ Clear filters
          </button>
        )}

        <span className="text-sm text-gray-400 self-center">
          {displayed.length} {displayed.length === 1 ? 'child' : 'children'}
          {(search || classFilter) && rows.length !== displayed.length && ` of ${rows.length}`}
        </span>
      </div>

      {/* Table */}
      <AdminTable
        columns={cols}
        rows={displayed}
        loading={loading}
        onEdit={openEdit}
        actions={row => (
          <div className="flex items-center gap-1.5">
            {/* Deactivate — only shown for active children */}
            {row.active && (
              <button
                onClick={() => setDeactivating(row)}
                className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-medium transition-colors"
                title="Mark as inactive"
              >
                Deactivate
              </button>
            )}
            {/* Delete — admin only */}
            {isAdmin && (
              <button
                onClick={() => setDeleting(row)}
                className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-medium transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        )}
        emptyMessage={
          search || classFilter
            ? 'No children match your search.'
            : 'No children added yet. Click "+ Add Child" to get started.'
        }
      />
      <Pagination page={page} totalPages={totalPages} onPageChange={load} />

      {/* ── Add / Edit modal ── */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? 'Edit Child Record' : 'Add Child'}
        size="lg"
      >
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="form-label">Full Name *</label>
              <input
                className={`form-input ${errors.name ? 'border-red-400' : ''}`}
                placeholder="Child's full name"
                {...f('name')}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="form-label">Date of Birth</label>
              <input type="date" className="form-input" {...f('dateOfBirth')} />
            </div>

            <div>
              <label className="form-label">Village</label>
              <input className="form-input" placeholder="e.g. Yerramalla" {...f('village')} />
            </div>

            <div>
              <label className="form-label">Class / Group</label>
              <input
                className="form-input"
                placeholder="e.g. Nursery, Primary, Junior…"
                {...f('classGroup')}
              />
            </div>

            <div>
              <label className="form-label">Parent / Guardian Name</label>
              <input className="form-input" placeholder="Parent's full name" {...f('parentName')} />
            </div>

            <div>
              <label className="form-label">Parent Contact Number</label>
              <input className="form-input" placeholder="+91-9XXXXXXXXX" {...f('parentContact')} />
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
                  {form.active ? 'Active — attending Sunday School' : 'Inactive — not currently attending'}
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setModal(false)}
              className="btn-secondary py-2 px-5 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary py-2 px-5 text-sm"
            >
              {saving ? 'Saving…' : editing ? 'Update Child' : 'Add Child'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Deactivate confirm ── */}
      <ConfirmDialog
        open={!!deactivating}
        title="Deactivate Child"
        message={`Mark "${deactivating?.name}" as inactive? The record will be kept but the child will no longer appear as active.`}
        onConfirm={confirmDeactivate}
        onCancel={() => setDeactivating(null)}
        loading={deactivateLoading}
      />

      {/* ── Delete confirm (admin only) ── */}
      <ConfirmDialog
        open={!!deleting}
        title="Delete Child Record"
        message={`Permanently delete the record for "${deleting?.name}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
        loading={deleteLoading}
      />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   TEACHERS TAB  (unchanged logic, slightly better UX)
   Accessible by: ADMIN only
   ───────────────────────────────────────────────────────────────── */
function TeachersTab() {
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

  const load = (p = 0) => {
    setLoading(true);
    sundaySchoolService.listTeachers(p, 20)
      .then(r => { const d = r.data.data; setRows(d.content); setTotalPages(d.totalPages); setPage(p); })
      .finally(() => setLoading(false));
  };

  useEffect(() => load(0), []);

  const openCreate = () => { setEditing(null); setForm({ name:'', village:'', contactNumber:'', email:'', classGroup:'', active:true, contactPublic:false }); setErrors({}); setModal(true); };
  const openEdit = (row) => { setEditing(row); setForm({ name: row.name, village: row.village||'', contactNumber: row.contactNumber||'', email: row.email||'', classGroup: row.classGroup||'', active: row.active, contactPublic: row.contactPublic }); setErrors({}); setModal(true); };

  const validate = () => { const e = {}; if (!form.name.trim()) e.name = 'Name is required'; setErrors(e); return Object.keys(e).length === 0; };

  const save = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (editing) await sundaySchoolService.updateTeacher(editing.id, form);
      else await sundaySchoolService.createTeacher(form);
      toast.success(editing ? 'Teacher updated successfully' : 'Teacher added successfully');
      setModal(false); load(page);
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try { await sundaySchoolService.deleteTeacher(deleting.id); toast.success('Teacher deleted'); setDeleting(null); load(page); }
    catch { toast.error('Delete failed'); } finally { setDeleteLoading(false); }
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  const cols = [
    { key: 'name',          label: 'Name' },
    { key: 'village',       label: 'Village' },
    { key: 'classGroup',    label: 'Class / Group' },
    { key: 'contactNumber', label: 'Contact' },
    { key: 'active', label: 'Status', render: r => <span className={`badge ${r.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{r.active ? '✓ Active' : '✗ Inactive'}</span> },
  ];

  return (
    <>
      <div className="flex justify-end mb-4">
        <button onClick={openCreate} className="btn-primary">+ Add Teacher</button>
      </div>
      <AdminTable columns={cols} rows={rows} loading={loading} onEdit={openEdit} onDelete={setDeleting} />
      <Pagination page={page} totalPages={totalPages} onPageChange={load} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Teacher' : 'Add Teacher'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Name *</label>
              <input className={`form-input ${errors.name ? 'border-red-400' : ''}`} placeholder="Teacher's full name" {...f('name')} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div><label className="form-label">Village</label><input className="form-input" placeholder="e.g. Yerramalla" {...f('village')} /></div>
            <div><label className="form-label">Contact Number</label><input className="form-input" placeholder="+91-9XXXXXXXXX" {...f('contactNumber')} /></div>
            <div><label className="form-label">Email</label><input type="email" className="form-input" placeholder="teacher@example.com" {...f('email')} /></div>
            <div className="md:col-span-2"><label className="form-label">Class / Group</label><input className="form-input" placeholder="e.g. Nursery, Primary…" {...f('classGroup')} /></div>
            <div className="md:col-span-2 flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="rounded" checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="rounded" checked={form.contactPublic} onChange={e => setForm(p => ({ ...p, contactPublic: e.target.checked }))} />
                Show contact publicly
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary py-2 px-5 text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary py-2 px-5 text-sm">{saving ? 'Saving…' : editing ? 'Update Teacher' : 'Add Teacher'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleting} title="Delete Teacher" message={`Delete "${deleting?.name}"?`}
        onConfirm={confirmDelete} onCancel={() => setDeleting(null)} loading={deleteLoading} />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   PROGRAMS TAB  (unchanged)
   Accessible by: ADMIN only
   ───────────────────────────────────────────────────────────────── */
function ProgramsTab() {
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

  const load = (p = 0) => {
    setLoading(true);
    sundaySchoolService.listPrograms(p, 20)
      .then(r => { const d = r.data.data; setRows(d.content); setTotalPages(d.totalPages); setPage(p); })
      .finally(() => setLoading(false));
  };

  useEffect(() => load(0), []);

  const openCreate = () => { setEditing(null); setForm({ title:'', description:'', programDate:'', location:'', videoUrl:'', published:true }); setImageFile(null); setErrors({}); setModal(true); };
  const openEdit = (row) => { setEditing(row); setForm({ title: row.title, description: row.description||'', programDate: row.programDate||'', location: row.location||'', videoUrl: row.videoUrl||'', published: row.published }); setImageFile(null); setErrors({}); setModal(true); };

  const validate = () => { const e = {}; if (!form.title.trim()) e.title = 'Title is required'; setErrors(e); return Object.keys(e).length === 0; };

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
      toast.success(editing ? 'Program updated successfully' : 'Program created successfully');
      setModal(false); load(page);
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try { await sundaySchoolService.deleteProgram(deleting.id); toast.success('Program deleted'); setDeleting(null); load(page); }
    catch { toast.error('Delete failed'); } finally { setDeleteLoading(false); }
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  const cols = [
    { key: 'title',       label: 'Title' },
    { key: 'programDate', label: 'Date' },
    { key: 'location',    label: 'Location' },
    { key: 'published', label: 'Status', render: r => <span className={`badge ${r.published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{r.published ? '✓ Published' : '○ Draft'}</span> },
  ];

  return (
    <>
      <div className="flex justify-end mb-4">
        <button onClick={openCreate} className="btn-primary">+ Add Program</button>
      </div>
      <AdminTable columns={cols} rows={rows} loading={loading} onEdit={openEdit} onDelete={setDeleting} />
      <Pagination page={page} totalPages={totalPages} onPageChange={load} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Program' : 'Add Program'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="form-label">Title *</label>
            <input className={`form-input ${errors.title ? 'border-red-400' : ''}`} placeholder="Program title" {...f('title')} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Program Date</label><input type="date" className="form-input" {...f('programDate')} /></div>
            <div><label className="form-label">Location</label><input className="form-input" placeholder="Venue" {...f('location')} /></div>
          </div>
          <div><label className="form-label">Description</label><textarea rows={3} className="form-input resize-none" {...f('description')} /></div>
          <div><label className="form-label">Video URL</label><input className="form-input" placeholder="https://youtube.com/…" {...f('videoUrl')} /></div>
          {!editing && (
            <div><label className="form-label">Image (optional)</label><input type="file" accept="image/jpeg,image/png,image/webp" className="form-input py-2" onChange={e => setImageFile(e.target.files[0])} /></div>
          )}
          <div className="flex items-center gap-2">
            <input type="checkbox" id="ppub" className="rounded" checked={form.published} onChange={e => setForm(p => ({ ...p, published: e.target.checked }))} />
            <label htmlFor="ppub" className="text-sm text-gray-700">Published — visible on public website</label>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary py-2 px-5 text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary py-2 px-5 text-sm">{saving ? 'Saving…' : editing ? 'Update Program' : 'Create Program'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleting} title="Delete Program" message={`Delete "${deleting?.title}"?`}
        onConfirm={confirmDelete} onCancel={() => setDeleting(null)} loading={deleteLoading} />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN PAGE — tab routing
   ───────────────────────────────────────────────────────────────── */
const TABS = [
  { key: 'children', label: '👶 Children', path: '/admin/sunday-school/children' },
  { key: 'teachers', label: '👩‍🏫 Teachers', path: '/admin/sunday-school/teachers' },
  { key: 'programs', label: '📖 Programs',  path: '/admin/sunday-school/programs' },
];

export default function AdminSundaySchoolPage() {
  const { section = 'children' } = useParams();
  const { isAdmin, isTeacher } = useAuth();

  // Teachers see only the Children tab
  const visibleTabs = isTeacher && !isAdmin
    ? TABS.filter(t => t.key === 'children')
    : TABS;

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-church-blue/10">
          <AcademicCapIcon className="h-6 w-6 text-church-blue" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-church-blue" style={{ fontFamily: 'Lora, Georgia, serif' }}>
            Sunday School
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Manage children, teachers and programs
          </p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
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

      {/* Tab content */}
      {section === 'children' && <ChildrenTab />}
      {section === 'teachers' && (isAdmin ? <TeachersTab /> : (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔒</p>
          <p>Teachers section is accessible to administrators only.</p>
        </div>
      ))}
      {section === 'programs' && (isAdmin ? <ProgramsTab /> : (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔒</p>
          <p>Programs section is accessible to administrators only.</p>
        </div>
      ))}
    </div>
  );
}
