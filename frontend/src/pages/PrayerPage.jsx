import { useState } from 'react';
import { prayerService } from '../services/prayerService';
import toast from 'react-hot-toast';

export default function PrayerPage() {
  const [form, setForm] = useState({ name: '', email: '', requestText: '', anonymous: false });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.requestText.trim()) e.requestText = 'Prayer request is required';
    else if (form.requestText.length < 10) e.requestText = 'Please write at least 10 characters';
    if (!form.anonymous && !form.name.trim()) e.name = 'Name is required if not anonymous';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await prayerService.submit(form);
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="text-6xl mb-6">🙏</div>
      <h2 className="text-2xl font-serif font-bold text-church-blue mb-3">Thank You for Trusting Us</h2>
      <p className="text-gray-600">Your prayer request has been received. We will lift you up in prayer.</p>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <span className="text-5xl">🙏</span>
        <h1 className="text-3xl font-serif font-bold text-church-blue mt-4 mb-2">Prayer Request</h1>
        <p className="text-gray-500">Share your prayer needs with our pastoral team. All requests are kept private.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div>
          <label className="form-label">
            <input type="checkbox" className="mr-2" checked={form.anonymous}
              onChange={e => setForm(f => ({ ...f, anonymous: e.target.checked }))} />
            Submit anonymously
          </label>
        </div>

        {!form.anonymous && (
          <>
            <div>
              <label className="form-label">Your Name *</label>
              <input className={`form-input ${errors.name ? 'border-red-400' : ''}`} value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="form-label">Email (optional)</label>
              <input type="email" className="form-input" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" />
            </div>
          </>
        )}

        <div>
          <label className="form-label">Your Prayer Request *</label>
          <textarea rows={5} className={`form-input resize-none ${errors.requestText ? 'border-red-400' : ''}`}
            value={form.requestText}
            onChange={e => setForm(f => ({ ...f, requestText: e.target.value }))}
            placeholder="Share your prayer request here..." />
          {errors.requestText && <p className="text-red-500 text-xs mt-1">{errors.requestText}</p>}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Submitting...' : 'Submit Prayer Request'}
        </button>
      </form>
    </div>
  );
}
