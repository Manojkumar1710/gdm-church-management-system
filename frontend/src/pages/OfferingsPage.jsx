import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDownIcon, HeartIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { offeringService } from '../services/offeringService';
import toast from 'react-hot-toast';
import { CHURCH_NAME } from '../config/church';
import DoveMedallion from '../components/ornaments/DoveMedallion';
import CrossDivider from '../components/ornaments/CrossDivider';
import LightRays from '../components/ornaments/LightRays';
import Stagger, { StaggerItem } from '../components/motion/Stagger';
import AnimatedText from '../components/motion/AnimatedText';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useLanguage } from '../context/LanguageContext';

const PARTICLES = [
  { left: '10%', top: '24%', size: 3, delay: 0, duration: 11, drift: 14, className: '' },
  { left: '22%', top: '72%', size: 2, delay: 1.4, duration: 13, drift: 10, className: '' },
  { left: '38%', top: '16%', size: 2, delay: 2.1, duration: 10, drift: 16, className: 'hidden sm:block' },
  { left: '52%', top: '84%', size: 3, delay: 0.7, duration: 12, drift: 12, className: '' },
  { left: '68%', top: '30%', size: 2, delay: 3.2, duration: 14, drift: 9, className: 'hidden sm:block' },
  { left: '82%', top: '62%', size: 3, delay: 1.9, duration: 11, drift: 15, className: '' },
  { left: '91%', top: '20%', size: 2, delay: 2.6, duration: 13, drift: 11, className: 'hidden sm:block' },
  { left: '6%', top: '52%', size: 2, delay: 4.1, duration: 12, drift: 8, className: 'hidden sm:block' },
];

const inputClass = 'form-input h-11 rounded-xl transition-all duration-200 focus:border-church-gold/60 focus:ring-2 focus:ring-church-gold/20';

function GivingAtmosphere({ reduced }) {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute left-1/2 top-0 -translate-x-1/2" style={{ width: 420, height: 420 }}>
        <motion.div
          className="h-full w-full rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.14) 0%, rgba(201,168,76,0) 70%)' }}
          animate={reduced ? undefined : { opacity: [0.55, 0.9, 0.55], scale: [1, 1.06, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      {PARTICLES.map((particle, index) => (
        <motion.span
          key={index}
          className={`absolute rounded-full bg-church-gold ${particle.className}`}
          style={{ left: particle.left, top: particle.top, width: particle.size, height: particle.size }}
          animate={reduced ? undefined : {
            y: [0, -particle.drift, 0],
            x: [0, particle.drift / 2, 0],
            opacity: [0.18, 0.6, 0.18],
          }}
          transition={{ duration: particle.duration, delay: particle.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

function FieldError({ id, children, reduced }) {
  if (!children) return null;
  return (
    <motion.p
      id={id}
      role="alert"
      className="form-error mt-1.5"
      initial={reduced ? false : { opacity: 0, y: -3 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.p>
  );
}

export default function OfferingsPage() {
  const { t, lang } = useLanguage();
  const reduced = useReducedMotion();
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
    <div className="relative isolate flex min-h-[70vh] items-center justify-center overflow-hidden bg-church-cream px-4 py-16">
      <GivingAtmosphere reduced={reduced} />
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-church-border bg-white p-8 text-center shadow-card sm:p-10"
      >
        <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full bg-church-gold/10 ring-1 ring-church-gold/20">
          <DoveMedallion size={64} withCircle={false} />
        </div>
        <h2 className="font-serif text-2xl font-bold text-church-blue">{t('offerings.successTitle')}</h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">{t('offerings.successMsg')}</p>
        <CrossDivider className="mt-6" opacity={0.25} />
      </motion.div>
    </div>
  );

  return (
    <div className="relative isolate overflow-hidden bg-church-cream">
      <GivingAtmosphere reduced={reduced} />

      <div className="mx-auto w-full max-w-[1180px] px-4 pb-14 pt-10 sm:px-6 sm:pb-16 sm:pt-12 lg:px-8">
        <section className="text-center">
          <motion.div
            className="mb-4 flex items-center justify-center gap-3"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            aria-hidden="true"
          >
            <span className="h-px w-8 bg-church-gold/60" />
            <span className="h-1.5 w-1.5 rotate-45 bg-church-gold" />
            <span className="h-px w-8 bg-church-gold/60" />
          </motion.div>

          <h1 className="font-serif text-3xl font-bold tracking-tight text-church-blue sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
            <AnimatedText text={t('offerings.heroTitle')} lang={lang} />
          </h1>

          <motion.p
            className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base"
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.28, ease: 'easeOut' }}
          >
            {t('offerings.heroDescription')}
          </motion.p>

          <CrossDivider className="mx-auto mt-6" opacity={0.28} />
        </section>

        <div className="mt-8 grid items-stretch gap-6 md:grid-cols-12 lg:gap-10">
          <motion.div
            className="h-full min-w-0 md:col-span-5"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.36, ease: 'easeOut' }}
          >
            <motion.div
              whileHover={reduced ? undefined : { y: -3 }}
              transition={{ duration: 0.3 }}
              className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-church-blue p-6 text-center shadow-card transition-shadow duration-300 hover:shadow-card-hover sm:p-7"
            >
              <div className="pointer-events-none absolute left-1/2 top-7 -translate-x-1/2" style={{ width: 224, height: 224 }}>
                <motion.div
                  className="h-full w-full rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.22) 0%, rgba(201,168,76,0) 68%)' }}
                  animate={reduced ? undefined : { opacity: [0.7, 1, 0.7], scale: [1, 1.05, 1] }}
                  transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>

              <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-church-gold">{t('offerings.givingLabel')}</p>
                <motion.div
                  className="relative my-5 grid h-40 w-40 place-items-center rounded-full border border-church-gold/25 bg-church-gold/5 shadow-[0_0_60px_-18px_rgba(201,168,76,0.6)] sm:h-44 sm:w-44"
                  style={{ willChange: 'transform' }}
                  animate={reduced ? undefined : { y: [0, -6, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <span className="pointer-events-none absolute inset-3 rounded-full bg-church-gold/10 blur-xl" aria-hidden="true" />
                  <DoveMedallion size={128} dark withCircle={false} />
                </motion.div>
                <h2 className="font-serif text-xl font-bold text-white sm:text-2xl">{t('home.everyGift')}</h2>
                <p className="mt-3 max-w-[280px] text-sm leading-relaxed text-white/75">
                  {t('home.generositySupports')} {CHURCH_NAME}.
                </p>
                <div className="mt-6 w-full border-t border-white/10 pt-5">
                  <p className="text-xs italic leading-relaxed text-church-gold/90">{t('offerings.givingNote')}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="h-full min-w-0 md:col-span-7"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.44, ease: 'easeOut' }}
          >
            <form onSubmit={handleSubmit} className="flex h-full flex-col rounded-2xl border border-church-border bg-white p-6 shadow-card sm:p-7">
              <div className="mb-6 flex items-start gap-3 border-b border-church-border pb-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-church-gold/10 text-church-gold ring-1 ring-church-gold/20">
                  <SparklesIcon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-serif text-lg font-bold text-church-blue">{t('offerings.title')}</h2>
                  <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                    {t('offerings.subtitle')} {CHURCH_NAME} {t('offerings.throughGiving')}
                  </p>
                </div>
              </div>

              <div className="flex flex-1 flex-col space-y-5">
                <div className="rounded-xl border border-church-border bg-church-light/70 p-3.5">
                  <label htmlFor="anonymous" className="flex cursor-pointer items-center gap-3 text-sm font-medium text-church-blue">
                    <input
                      id="anonymous"
                      name="anonymous"
                      type="checkbox"
                      className="h-4 w-4 rounded border-church-border accent-church-blue focus:ring-2 focus:ring-church-gold/30"
                      checked={form.anonymous}
                      onChange={e => setForm(f => ({ ...f, anonymous: e.target.checked }))}
                    />
                    {t('offerings.anonymous')}
                  </label>
                </div>

                {!form.anonymous && (
                  <Stagger className="grid gap-5 sm:grid-cols-2" staggerDelay={0.06}>
                    <StaggerItem>
                      <div>
                        <label htmlFor="donorName" className="form-label mb-1.5">{t('offerings.yourName')}</label>
                        <input
                          id="donorName"
                          name="donorName"
                          type="text"
                          autoComplete="name"
                          className={`${inputClass} ${errors.donorName ? '!border-red-400' : ''}`}
                          value={form.donorName}
                          onChange={e => setForm(f => ({ ...f, donorName: e.target.value }))}
                          placeholder={t('offerings.yourName').replace(' *', '')}
                          aria-invalid={Boolean(errors.donorName)}
                          aria-describedby={errors.donorName ? 'donorName-error' : undefined}
                        />
                        <FieldError id="donorName-error" reduced={reduced}>{errors.donorName}</FieldError>
                      </div>
                    </StaggerItem>
                    <StaggerItem>
                      <div>
                        <label htmlFor="email" className="form-label mb-1.5">{t('offerings.email')}</label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          className={inputClass}
                          value={form.email}
                          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                          placeholder="your@email.com"
                        />
                      </div>
                    </StaggerItem>
                  </Stagger>
                )}

                <div>
                  <label htmlFor="amount" className="form-label mb-1.5">{t('offerings.amount')}</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm font-semibold text-church-blue" aria-hidden="true">₹</span>
                    <input
                      id="amount"
                      name="amount"
                      type="number"
                      min="1"
                      step="1"
                      className={`${inputClass} pl-8 ${errors.amount ? '!border-red-400' : ''}`}
                      value={form.amount}
                      onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                      placeholder="0"
                      aria-invalid={Boolean(errors.amount)}
                      aria-describedby={errors.amount ? 'amount-error' : undefined}
                    />
                  </div>
                  <FieldError id="amount-error" reduced={reduced}>{errors.amount}</FieldError>
                </div>

                <div>
                  <label htmlFor="purposeId" className="form-label mb-1.5">{t('offerings.purpose')}</label>
                  <div className="relative">
                    <select
                      id="purposeId"
                      name="purposeId"
                      className={`${inputClass} appearance-none pr-10`}
                      value={form.purposeId}
                      onChange={e => setForm(f => ({ ...f, purposeId: e.target.value }))}
                    >
                      <option value="">{t('offerings.selectPurpose')}</option>
                      {purposes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-church-blue/60" aria-hidden="true" />
                  </div>
                </div>

                <div>
                  <label htmlFor="paymentMethod" className="form-label mb-1.5">{t('offerings.paymentMethod')}</label>
                  <div className="relative">
                    <select
                      id="paymentMethod"
                      name="paymentMethod"
                      className={`${inputClass} appearance-none pr-10`}
                      value={form.paymentMethod}
                      onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}
                    >
                      <option value="">{t('offerings.selectMethod')}</option>
                      {['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Other'].map(m => <option key={m}>{m}</option>)}
                    </select>
                    <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-church-blue/60" aria-hidden="true" />
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="form-label mb-1.5">{t('offerings.notes')}</label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className={`${inputClass} resize-none py-3`}
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder={t('offerings.notesPlaceholder')}
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={reduced || loading ? undefined : { scale: 1.01 }}
                  whileTap={reduced || loading ? undefined : { scale: 0.99 }}
                  className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm shadow-card-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <HeartIcon className="h-4 w-4" aria-hidden="true" />
                  {loading ? t('offerings.submitting') : t('offerings.submitBtn')}
                </motion.button>

                <p className="pt-1 text-center text-xs leading-relaxed text-gray-400">
                  {t('offerings.private')}
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
