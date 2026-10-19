import { useEffect, useState } from 'react';
import { offeringService } from '../services/offeringService';
import toast from 'react-hot-toast';
import { CHURCH_NAME } from '../config/church';
import DoveMedallion from '../components/ornaments/DoveMedallion';
import CrossDivider  from '../components/ornaments/CrossDivider';
import { useLanguage } from '../context/LanguageContext';

export default function OfferingsPage() {
  const { t } = useLanguage();
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
    if (!form.amount || Number(form.amount) < 1) e.amount = t('offerings.errors.amountRequired');
    if (!form.anonymous && !form.donorName.trim()) e.donorName = t('offerings.errors.nameRequired');
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
      toast.error(err.response?.data?.message || t('contact.errors.messageRequired'));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="text-6xl mb-6">🙌</div>
      <h2 className="text-2xl font-serif font-bold text-church-blue mb-3">{t('offerings.successTitle')}</h2>
      <p className="text-gray-600">{t('offerings.successMsg')}</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      {/* Page header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-serif font-bold text-church-blue mb-2">{t('offerings.title')}</h1>
        <p className="text-gray-500">{t('offerings.subtitle')} {CHURCH_NAME} {t('offerings.throughGiving')}</p>
      </div>

      <CrossDivider className="mb-10" opacity={0.3} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">

        {/* ── Form ── */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-card border border-church-border p-7 space-y-5">
            <div>
              <label className="form-label">
                <input type="checkbox" className="mr-2" checked={form.anonymous}
                  onChange={e => setForm(f => ({ ...f, anonymous: e.target.checked }))} />
                {t('offerings.anonymous')}
              </label>
            </div>

            {!form.anonymous && (
              <>
                <div>
                  <label className="form-label">{t('offerings.yourName')}</label>
                  <input className={`form-input ${errors.donorName ? 'border-red-400' : ''}`}
                    value={form.donorName} onChange={e => setForm(f => ({ ...f, donorName: e.target.value }))} placeholder={t('offerings.yourName').replace(' *','')} />
                  {errors.donorName && <p className="text-red-500 text-xs mt-1">{errors.donorName}</p>}
                </div>
                <div>
                  <label className="form-label">{t('offerings.email')}</label>
                  <input type="email" className="form-input" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" />
                </div>
              </>
            )}

            <div>
              <label className="form-label">{t('offerings.amount')}</label>
              <input type="number" min="1" step="1" className={`form-input ${errors.amount ? 'border-red-400' : ''}`}
                value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" />
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
            </div>

            <div>
              <label className="form-label">{t('offerings.purpose')}</label>
              <select className="form-input" value={form.purposeId}
                onChange={e => setForm(f => ({ ...f, purposeId: e.target.value }))}>
                <option value="">{t('offerings.selectPurpose')}</option>
                {purposes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div>
              <label className="form-label">{t('offerings.paymentMethod')}</label>
              <select className="form-input" value={form.paymentMethod}
                onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}>
                <option value="">{t('offerings.selectMethod')}</option>
                {['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Other'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="form-label">{t('offerings.notes')}</label>
              <textarea rows={3} className="form-input resize-none" value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder={t('offerings.notesPlaceholder')} />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? t('offerings.submitting') : t('offerings.submitBtn')}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4">
            {t('offerings.private')}
          </p>
        </div>

        {/* ── Decorative panel (desktop only) ── */}
        <div className="hidden lg:flex lg:col-span-2 flex-col items-center justify-center gap-4">
          <DoveMedallion size={200} />
          <div className="text-center px-2">
            <p className="font-serif font-semibold text-church-blue text-lg leading-snug mb-1.5">
              {t('home.everyGift')}
            </p>
            <p className="text-gray-600 text-sm leading-relaxed max-w-[220px] mx-auto">
              {t('home.generositySupports')} {CHURCH_NAME}.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
