import { useState, useEffect } from 'react';
import { contactService } from '../services/prayerService';
import { churchService } from '../services/churchService';
import toast from 'react-hot-toast';
import DoveMedallion from '../components/ornaments/DoveMedallion';
import CrossDivider  from '../components/ornaments/CrossDivider';
import { useLanguage } from '../context/LanguageContext';

export default function ContactPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [churchInfo, setChurchInfo] = useState(null);

  useEffect(() => {
    churchService.getInfo().then(r => setChurchInfo(r.data.data)).catch(() => {});
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = t('contact.errors.nameRequired');
    if (!form.email.trim()) e.email = t('contact.errors.emailRequired');
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = t('contact.errors.emailInvalid');
    if (!form.message.trim()) e.message = t('contact.errors.messageRequired');
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
      toast.error(err.response?.data?.message || t('contact.errors.messageRequired'));
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
      <h2 className="text-2xl font-serif font-bold text-church-blue mb-3">{t('contact.successTitle')}</h2>
      <p className="text-gray-600">{t('contact.successMsg')}</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-serif font-bold text-church-blue mb-2">{t('contact.title')}</h1>
        <p className="text-gray-500">{t('contact.subtitle')}</p>
      </div>

      <CrossDivider className="mb-10" opacity={0.3} />

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
        {/* Church info panel */}
        <div className="md:col-span-2 relative overflow-hidden bg-church-blue text-white rounded-3xl p-6 space-y-4">
          <DoveMedallion
            size={78}
            dark
            className="absolute top-3 right-3 opacity-30"
          />
          <h2 className="font-bold text-church-gold text-sm uppercase tracking-widest">{t('contact.findUs')}</h2>
          <div className="space-y-3 text-sm text-white/80">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 shrink-0">📍</span>
              <span>{churchInfo?.address || 'GDM Church, Chopparamma Gudem, Koyyalagudem, West Godavari — 534312'}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span>📞</span>
              <a href={`tel:${churchInfo?.phone || '9494154193'}`} className="hover:text-white transition-colors">
                {churchInfo?.phone || '9494154193'}
              </a>
            </div>
            <div className="flex items-center gap-2.5">
              <span>✉️</span>
              <a href={`mailto:${churchInfo?.email || 'Gdmchrg@gmail.com'}`} className="hover:text-white transition-colors break-all">
                {churchInfo?.email || 'Gdmchrg@gmail.com'}
              </a>
            </div>
          </div>
          {churchInfo?.mapUrl && (
            <a
              href={churchInfo.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center gap-2 bg-church-gold hover:bg-yellow-600 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors w-full justify-center"
            >
              {t('contact.getDirections')}
            </a>
          )}
        </div>

        {/* Form */}
        <div className="md:col-span-3">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div>
              <label className="form-label">{t('contact.fullName')}</label>
              <input className={`form-input ${errors.name ? 'border-red-400' : ''}`} {...field('name')} placeholder={t('contact.fullName').replace(' *','')} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="form-label">{t('contact.email')}</label>
              <input type="email" className={`form-input ${errors.email ? 'border-red-400' : ''}`} {...field('email')} placeholder="your@email.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="form-label">{t('contact.phone')}</label>
              <input type="tel" className="form-input" {...field('phone')} placeholder="+91-..." />
            </div>
            <div>
              <label className="form-label">{t('contact.subject')}</label>
              <input className="form-input" {...field('subject')} placeholder={t('contact.subjectPlaceholder')} />
            </div>
            <div>
              <label className="form-label">{t('contact.message')}</label>
              <textarea rows={4} className={`form-input resize-none ${errors.message ? 'border-red-400' : ''}`}
                {...field('message')} placeholder={t('contact.messagePlaceholder')} />
              {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? t('contact.sending') : t('contact.sendBtn')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
