import { useState } from 'react';
import { contactService } from '../services/prayerService';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.message.trim()) e.message = 'Message is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await contactService.submit(form);
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = (key) => ({
    value: form[key],
    onChange: e => setForm(f => ({ ...f, [key]: e.target.value })),
  });

  if (submitted) return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="text-6xl mb-6">✉️</div>
      <h2 className="text-2xl font-serif font-bold text-church-blue mb-3">Message Sent!</h2>
      <p className="text-gray-600">Thank you for reaching out. We will get back to you soon.</p>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-serif font-bold text-church-blue mb-2">Contact Us</h1>
        <p className="text-gray-500">We'd love to hear from you. Send us a message.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div>
          <label className="form-label">Full Name *</label>
          <input className={`form-input ${errors.name ? 'border-red-400' : ''}`} {...field('name')} placeholder="Your name" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="form-label">Email *</label>
          <input type="email" className={`form-input ${errors.email ? 'border-red-400' : ''}`} {...field('email')} placeholder="your@email.com" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="form-label">Phone (optional)</label>
          <input type="tel" className="form-input" {...field('phone')} placeholder="+91-..." />
        </div>
        <div>
          <label className="form-label">Subject</label>
          <input className="form-input" {...field('subject')} placeholder="What is this about?" />
        </div>
        <div>
          <label className="form-label">Message *</label>
          <textarea rows={5} className={`form-input resize-none ${errors.message ? 'border-red-400' : ''}`}
            {...field('message')} placeholder="Your message..." />
          {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}
