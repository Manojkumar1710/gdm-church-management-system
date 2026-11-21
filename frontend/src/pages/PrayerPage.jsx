import { useState } from 'react';
import { motion } from 'framer-motion';
import { prayerService } from '../services/prayerService';
import toast from 'react-hot-toast';
import DoveMedallion from '../components/ornaments/DoveMedallion';
import CrossDivider from '../components/ornaments/CrossDivider';
import LightRays from '../components/ornaments/LightRays';
import DotPattern from '../components/ornaments/DotPattern';
import prayerBgImg from '../assets/images/prayer-bg.jpg';
import doveImg from '../assets/images/dove.png';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useLanguage } from '../context/LanguageContext';
import AnimatedText from '../components/motion/AnimatedText';

const EASE = [0.22, 1, 0.36, 1];

const PARTICLES = [
  { left: '12%', top: '18%', size: 3, delay: 0, duration: 10, drift: 12 },
  { left: '26%', top: '76%', size: 2, delay: 1.6, duration: 12, drift: 9 },
  { left: '48%', top: '12%', size: 2, delay: 2.4, duration: 11, drift: 14, className: 'hidden sm:block' },
  { left: '72%', top: '68%', size: 3, delay: 0.9, duration: 13, drift: 10 },
  { left: '86%', top: '28%', size: 2, delay: 3.1, duration: 12, drift: 8, className: 'hidden sm:block' },
  { left: '8%', top: '58%', size: 2, delay: 4.2, duration: 11, drift: 7, className: 'hidden sm:block' },
];

const inputClass = 'form-input h-11 rounded-xl transition-all duration-200 focus:border-church-gold/60 focus:ring-2 focus:ring-church-gold/20';

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

export default function PrayerPage() {
  const { t, lang } = useLanguage();
  const reduced = useReducedMotion();
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
    <div className="relative isolate flex min-h-[70vh] items-center justify-center overflow-hidden bg-church-cream px-4 py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-1/4 -translate-x-1/2" style={{ width: 360, height: 360 }}>
          <motion.div
            className="h-full w-full rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.16) 0%, rgba(201,168,76,0) 70%)' }}
            animate={reduced ? undefined : { opacity: [0.6, 0.95, 0.6], scale: [1, 1.05, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        {PARTICLES.map((particle, index) => (
          <motion.span
            key={index}
            className={`absolute rounded-full bg-church-gold ${particle.className || ''}`}
            style={{ left: particle.left, top: particle.top, width: particle.size, height: particle.size, opacity: 0.28 }}
            animate={reduced ? undefined : {
              y: [0, -particle.drift, 0],
              opacity: [0.18, 0.55, 0.18],
            }}
            transition={{ duration: particle.duration, delay: particle.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-church-border bg-white p-8 text-center shadow-card sm:p-10"
      >
        <div className="mx-auto mb-5 grid h-24 w-24 place-items-center rounded-full border border-church-gold/25 bg-church-gold/5 shadow-[0_0_60px_-18px_rgba(201,168,76,0.6)]">
          <DoveMedallion size={96} withCircle={false} />
        </div>
        <h2 className="font-serif text-2xl font-bold text-church-blue">{t('prayer.successTitle')}</h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">{t('prayer.successMsg')}</p>
        <CrossDivider className="mt-6" opacity={0.25} />
      </motion.div>
    </div>
  );

  return (
    <div>
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
            <AnimatedText text={t('prayer.title')} lang={lang} />
          </h1>
          <p className="text-white/65 text-sm max-w-md">
            {t('prayer.subtitle')}
          </p>
        </div>
      </div>

      <div className="relative isolate overflow-hidden bg-church-cream">
        <div className="mx-auto w-full max-w-[1180px] px-4 pb-16 pt-12 sm:px-6 sm:pt-14 lg:px-8">
          <div className="grid items-stretch gap-8 md:grid-cols-12 lg:gap-12">
            <motion.div
              className="h-full min-w-0 md:col-span-5"
              initial={reduced ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <div className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-church-blue p-7 shadow-card sm:p-8">
                <DotPattern cols={5} rows={5} gap={16} opacity={0.18} className="absolute right-4 top-4" />
                <div className="pointer-events-none absolute left-1/2 top-14 -translate-x-1/2" style={{ width: 320, height: 320 }}>
                  <motion.div
                    className="h-full w-full rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.18) 0%, rgba(201,168,76,0) 70%)' }}
                    animate={reduced ? undefined : { opacity: [0.55, 0.9, 0.55], scale: [1, 1.05, 1] }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>
                <LightRays width={420} opacity={0.12} className="absolute left-1/2 top-0 -translate-x-1/2" />
                {PARTICLES.map((particle, index) => (
                  <motion.span
                    key={index}
                    className={`pointer-events-none absolute rounded-full bg-church-gold ${particle.className || ''}`}
                    style={{ left: particle.left, top: particle.top, width: particle.size, height: particle.size, opacity: 0.28 }}
                    animate={reduced ? undefined : {
                      y: [0, -particle.drift, 0],
                      opacity: [0.18, 0.55, 0.18],
                    }}
                    transition={{ duration: particle.duration, delay: particle.delay, repeat: Infinity, ease: 'easeInOut' }}
                  />
                ))}

                <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center">
                  <motion.div
                    className="relative mb-6 grid h-60 w-60 place-items-center rounded-full border border-church-gold/25 bg-church-gold/5 shadow-[0_0_70px_-20px_rgba(201,168,76,0.65)] sm:h-64 sm:w-64"
                    animate={reduced ? undefined : { y: [0, -8, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <div className="absolute inset-6 rounded-full bg-church-gold/10 blur-2xl" aria-hidden="true" />
                    <DoveMedallion size={220} dark withCircle={false} />
                  </motion.div>

                  <motion.h2
                    className="font-serif text-xl font-bold leading-snug text-white sm:text-2xl"
                    initial={reduced ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.75, delay: 0.18, ease: EASE }}
                  >
                    {t('prayer.weArePraying')}
                  </motion.h2>

                  <motion.p
                    className="mt-3 max-w-[320px] text-sm leading-relaxed text-white/75"
                    initial={reduced ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.32, ease: EASE }}
                  >
                    {t('prayer.prayerMessage')}
                  </motion.p>

                  <CrossDivider className="mt-6" opacity={0.25} />
                </div>
              </div>
            </motion.div>

            <motion.div
              className="h-full min-w-0 md:col-span-7"
              initial={reduced ? false : { opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.12, ease: EASE }}
            >
              <form onSubmit={handleSubmit} className="flex h-full flex-col rounded-2xl border border-church-border bg-white p-6 shadow-card sm:p-8">
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
                      {t('prayer.anonymous')}
                    </label>
                  </div>

                  {!form.anonymous && (
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="name" className="form-label mb-1.5">{t('prayer.yourName')}</label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          className={`${inputClass} ${errors.name ? '!border-red-400' : ''}`}
                          value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          placeholder={t('prayer.yourName').replace(' *', '')}
                          aria-invalid={Boolean(errors.name)}
                          aria-describedby={errors.name ? 'name-error' : undefined}
                        />
                        <FieldError id="name-error" reduced={reduced}>{errors.name}</FieldError>
                      </div>
                      <div>
                        <label htmlFor="email" className="form-label mb-1.5">{t('prayer.email')}</label>
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
                    </div>
                  )}

                  <div>
                    <label htmlFor="requestText" className="form-label mb-1.5">{t('prayer.yourRequest')}</label>
                    <textarea
                      id="requestText"
                      name="requestText"
                      rows={5}
                      className={`${inputClass} min-h-[140px] resize-none py-3 ${errors.requestText ? '!border-red-400' : ''}`}
                      value={form.requestText}
                      onChange={e => setForm(f => ({ ...f, requestText: e.target.value }))}
                      placeholder={t('prayer.placeholder')}
                      aria-invalid={Boolean(errors.requestText)}
                      aria-describedby={errors.requestText ? 'requestText-error' : undefined}
                    />
                    <FieldError id="requestText-error" reduced={reduced}>{errors.requestText}</FieldError>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={reduced || loading ? undefined : { scale: 1.01 }}
                    whileTap={reduced || loading ? undefined : { scale: 0.99 }}
                    className="btn-primary mt-auto w-full rounded-xl py-3 text-sm shadow-card-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? t('prayer.submitting') : t('prayer.submitBtn')}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
