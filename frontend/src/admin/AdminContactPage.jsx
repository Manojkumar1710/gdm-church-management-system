import { useEffect, useState } from 'react';
import { contactService } from '../services/prayerService';
import AdminTable from './components/AdminTable';
import Pagination from './components/Pagination';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  NEW: 'bg-blue-100 text-blue-700',
  READ: 'bg-yellow-100 text-yellow-700',
  RESOLVED: 'bg-green-100 text-green-700',
};

export default function AdminContactPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [viewing, setViewing] = useState(null);

  const load = (p = 0) => {
    setLoading(true);
    contactService.adminList(p, 20)
      .then(r => { const d = r.data.data; setRows(d.content); setTotalPages(d.totalPages); setPage(p); })
      .finally(() => setLoading(false));
  };

  useEffect(() => load(0), []);

  const changeStatus = async (row, status) => {
    try {
      await contactService.updateStatus(row.id, status);
      toast.success('Status updated');
      load(page);
      if (viewing?.id === row.id) setViewing(v => ({ ...v, status }));
    } catch { toast.error('Update failed'); }
  };

  const cols = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'subject', label: 'Subject' },
    { key: 'createdAt', label: 'Received', render: r => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—' },
    { key: 'status', label: 'Status', render: r => <span className={`badge ${STATUS_COLORS[r.status] || ''}`}>{r.status}</span> },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-church-blue">Contact Messages</h1>
        <p className="text-gray-500 text-sm">Messages from the public contact form</p>
      </div>

      <AdminTable
        columns={cols} rows={rows} loading={loading}
        onEdit={setViewing}
        actions={row => (
          <select
            value={row.status}
            onChange={e => changeStatus(row, e.target.value)}
            className="text-xs border border-gray-200 rounded px-2 py-1"
          >
            {['NEW', 'READ', 'RESOLVED'].map(s => <option key={s}>{s}</option>)}
          </select>
        )}
      />
      <Pagination page={page} totalPages={totalPages} onPageChange={load} />

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Contact Message" size="lg">
        {viewing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-500 text-xs mb-1">Name</p><p className="font-medium">{viewing.name}</p></div>
              <div><p className="text-gray-500 text-xs mb-1">Email</p><a href={`mailto:${viewing.email}`} className="text-blue-600 hover:underline">{viewing.email}</a></div>
              <div><p className="text-gray-500 text-xs mb-1">Phone</p><p>{viewing.phone || '—'}</p></div>
              <div><p className="text-gray-500 text-xs mb-1">Received</p><p>{viewing.createdAt ? new Date(viewing.createdAt).toLocaleString() : '—'}</p></div>
            </div>
            {viewing.subject && (
              <div><p className="text-gray-500 text-xs mb-1">Subject</p><p className="font-medium">{viewing.subject}</p></div>
            )}
            <div>
              <p className="text-gray-500 text-xs mb-1">Message</p>
              <p className="text-gray-800 leading-relaxed whitespace-pre-line bg-gray-50 p-3 rounded-lg text-sm">
                {viewing.message}
              </p>
            </div>
            <div>
              <label className="form-label">Update Status</label>
              <select value={viewing.status} onChange={e => changeStatus(viewing, e.target.value)} className="form-input">
                {['NEW', 'READ', 'RESOLVED'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
