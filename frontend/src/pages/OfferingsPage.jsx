import { useEffect, useState } from 'react';
import { offeringService } from '../services/offeringService';
import toast from 'react-hot-toast';

export default function OfferingsPage() {
  const [purposes, setPurposes] = useState([]);
  const [form, setForm] = useState({ donorName: '', email: '', amount: '', purposeId: '', paymentMethod: '', notes: '', anonymous: false });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    offeringService.getPurposes().then(r => setPurposes(r.data.data || []));
  }, []);

  const validate = () => {
    const e = {};
    if (!form.amount || Number(form.amount) < 1) e.amount = 'Amount must be at least ₹1';
    if (!form.anonymous && !form.donorName.trim()) e.donorName = 'Name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await offeringService.submit({
        ...form,
        amount: Number(form.amount),
        offeringDate: new Date().toISOString().split('T')[0],
        purposeId: form.purposeId ? Number(form.purposeId) : null,
      });
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="text-6xl mb-6">🙌</div>
      <h2 className="text-2xl font-serif font-bold text-church-blue mb-3">Thank You for Your Generosity!</h2>
      <p className="text-gray-600">Your offering has been recorded. May God bless you abundantly.</p>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-serif font-bold text-church-blue mb-2">Give an Offering</h1>
        <p className="text-gray-500">Support the work of GDM Church through your generous giving.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div>
          <label className="form-label">
            <input type="checkbox" className="mr-2" checked={form.anonymous}
              onChange={e => setForm(f => ({ ...f, anonymous: e.target.checked }))} />
            Give anonymously
          </label>
        </div>

        {!form.anonymous && (
          <>
            <div>
              <label className="form-label">Your Name *</label>
              <input className={`form-input ${errors.donorName ? 'border-red-400' : ''}`}
                value={form.donorName} onChange={e => setForm(f => ({ ...f, donorName: e.target.value }))} placeholder="Full name" />
              {errors.donorName && <p className="text-red-500 text-xs mt-1">{errors.donorName}</p>}
            </div>
            <div>
              <label className="form-label">Email (optional)</label>
              <input type="email" className="form-input" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" />
            </div>
          </>
        )}

        <div>
          <label className="form-label">Amount (₹) *</label>
          <input type="number" min="1" step="1" className={`form-input ${errors.amount ? 'border-red-400' : ''}`}
            value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="Enter amount" />
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
        </div>

        <div>
          <label className="form-label">Purpose</label>
          <select className="form-input" value={form.purposeId}
            onChange={e => setForm(f => ({ ...f, purposeId: e.target.value }))}>
            <option value="">Select a purpose...</option>
            {purposes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div>
          <label className="form-label">Payment Method</label>
          <select className="form-input" value={form.paymentMethod}
            onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}>
            <option value="">Select method...</option>
            {['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Other'].map(m => <option key={m}>{m}</option>)}
          </select>
        </div>

        <div>
          <label className="form-label">Notes (optional)</label>
          <textarea rows={3} className="form-input resize-none" value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any additional notes..." />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Submitting...' : 'Submit Offering'}
        </button>
      </form>

      <p className="text-xs text-gray-400 text-center mt-4">
        Your offering information is kept private and secure.
      </p>
    </div>
  );
}
