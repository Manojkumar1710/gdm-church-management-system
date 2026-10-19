import { useState } from 'react';
import { prayerService } from '../services/prayerService';
import toast from 'react-hot-toast';
import DoveMedallion from '../components/ornaments/DoveMedallion';
import CrossDivider  from '../components/ornaments/CrossDivider';
import prayerBgImg   from '../assets/images/prayer-bg.jpg';
import doveImg       from '../assets/images/dove.png';
import { useLanguage } from '../context/LanguageContext';

export default function PrayerPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', requestText: '', anonymous: false });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.requestText.trim()) e.requestText = t('prayer.errors.requestRequired');
    else if (form.requestText.length < 10) e.requestText = t('prayer.errors.requestTooShort');
    if (!form.anonymous && !form.name.trim()) e.name = t('prayer.errors.nameRequired');
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
      toast.error(err.response?.data?.message || t('contact.errors.messageRequired'));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="text-6xl mb-6">🙏</div>
      <h2 className="text-2xl font-serif font-bold text-church-blue mb-3">{t('prayer.successTitle')}</h2>
      <p className="text-gray-600">{t('prayer.successMsg')}</p>
    </div>
  );

  return (
    <div>

      {/* ── Photo banner header ─────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ height: '260px' }}>
        <img
          src={prayerBgImg}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(8,16,36,0.68)' }}
          aria-hidden="true"
        />
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
          <img
            src={doveImg}
            alt=""
            aria-hidden="true"
            className="w-14 h-auto object-contain mb-3"
            style={{ filter: 'brightness(10) opacity(0.80)' }}
          />
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2"
              style={{ fontFamily: 'Lora, Georgia, serif' }}>
            {t('prayer.title')}
          </h1>
          <p className="text-white/65 text-sm max-w-md">
            {t('prayer.subtitle')}
          </p>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-white to-transparent"
             aria-hidden="true" />
      </div>

      {/* ── Form area ───────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <CrossDivider className="mb-10" opacity={0.3} />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">

          {/* ── Form ── */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-card border border-church-border p-7 space-y-5">
              <div>
                <label className="form-label">
                  <input type="checkbox" className="mr-2" checked={form.anonymous}
                    onChange={e => setForm(f => ({ ...f, anonymous: e.target.checked }))} />
                  {t('prayer.anonymous')}
                </label>
              </div>

              {!form.anonymous && (
                <>
                  <div>
                    <label className="form-label">{t('prayer.yourName')}</label>
                    <input className={`form-input ${errors.name ? 'border-red-400' : ''}`} value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={t('prayer.yourName').replace(' *','')} />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="form-label">{t('prayer.email')}</label>
                    <input type="email" className="form-input" value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" />
                  </div>
                </>
              )}

              <div>
                <label className="form-label">{t('prayer.yourRequest')}</label>
                <textarea rows={5} className={`form-input resize-none ${errors.requestText ? 'border-red-400' : ''}`}
                  value={form.requestText}
                  onChange={e => setForm(f => ({ ...f, requestText: e.target.value }))}
                  placeholder={t('prayer.placeholder')} />
                {errors.requestText && <p className="text-red-500 text-xs mt-1">{errors.requestText}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? t('prayer.submitting') : t('prayer.submitBtn')}
              </button>
            </form>
          </div>

          {/* ── Decorative panel (desktop only) ── */}
          <div className="hidden lg:flex lg:col-span-2 flex-col items-center justify-center gap-4">
            <DoveMedallion size={200} />
            <div className="text-center px-2">
              <p className="font-serif font-semibold text-church-blue text-lg leading-snug mb-1.5">
                {t('prayer.weArePraying')}
              </p>
              <p className="text-gray-600 text-sm leading-relaxed max-w-[220px] mx-auto">
                {t('prayer.prayingDesc')}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
