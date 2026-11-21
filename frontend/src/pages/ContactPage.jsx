import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { contactService } from '../services/prayerService';
import { churchService } from '../services/churchService';
import toast from 'react-hot-toast';
import CrossDivider from '../components/ornaments/CrossDivider';
import Reveal from '../components/motion/Reveal';
import Stagger, { StaggerItem } from '../components/motion/Stagger';
import AnimatedText from '../components/motion/AnimatedText';
import { useLanguage } from '../context/LanguageContext';
import { useReducedMotion } from '../hooks/useReducedMotion';
import {
  ArrowPathIcon,
  ArrowRightIcon,
  ClockIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  MapPinIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';

const EASE = [0.22, 1, 0.36, 1];

function FieldError({ id, message, reduced }) {
  if (!message) return null;
  return (
    <motion.p
      id={id}
      role="alert"
      className="form-error"
      initial={{ opacity: 0, y: reduced ? 0 : -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: EASE }}
    >
      <ExclamationCircleIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </motion.p>
  );
}

function ContactInfoCard({ icon: Icon, label, reduced, children }) {
  return (
    <StaggerItem>
      <motion.article
        whileHover={reduced ? undefined : { y: -4 }}
        transition={{ duration: 0.25, ease: EASE }}
        className="group relative flex items-start gap-3 overflow-hidden rounded-xl border border-white/10 bg-white/[0.06] p-3.5 shadow-none transition-[border-color,box-shadow] duration-300 ease-flow hover:border-church-gold/40 hover:shadow-[0_14px_32px_-20px_rgba(0,0,0,0.55)]"
      >
        <span className="absolute left-0 top-3 h-7 w-0.5 rounded-r-full bg-church-gold/55" aria-hidden="true" />
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10 text-church-gold ring-1 ring-inset ring-white/10 ${reduced ? '' : 'transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3'}`}>
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
            {label}
          </p>
          {children}
        </div>
      </motion.article>
    </StaggerItem>
  );
}

export default function ContactPage() {
  const { t, lang } = useLanguage();
  const reduced = useReducedMotion();
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
    id: `contact-${key}`,
    name: key,
    value: form[key],
    onChange: e => setForm(f => ({ ...f, [key]: e.target.value })),
  });

  const revealProps = (delay = 0) => ({
    initial: { opacity: 0, y: reduced ? 0 : 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.5, delay, ease: EASE },
  });

  const inputCls = 'form-input h-11 rounded-xl hover:border-navy-200 focus:border-church-gold focus:ring-2 focus:ring-church-gold/25';
  const address = churchInfo?.address || 'GDM Church, Chopparamma Gudem, Koyyalagudem, West Godavari — 534312';
  const phone = churchInfo?.phone || '9494154193';
  const email = churchInfo?.email || 'Gdmchrg@gmail.com';

  if (submitted) return (
    <motion.div
      className="mx-auto w-full max-w-[1180px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8"
      initial={{ opacity: 0, y: reduced ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      <div className="mx-auto max-w-xl rounded-2xl border border-church-border bg-white p-8 text-center shadow-card sm:p-10">
        <motion.div
          className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-church-gold/15"
          initial={{ opacity: 0, scale: reduced ? 1 : 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.12, ease: EASE }}
        >
          <EnvelopeIcon className="h-6 w-6 text-church-gold" aria-hidden="true" />
        </motion.div>
        <h2 className="mb-3 font-serif text-2xl font-bold text-church-blue">{t('contact.successTitle')}</h2>
        <p className="text-sm leading-relaxed text-gray-600 sm:text-base">{t('contact.successMsg')}</p>
      </div>
    </motion.div>
  );

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 pb-10 pt-10 sm:px-6 sm:py-12 lg:px-8">
      <header className="relative mb-8 text-center sm:mb-9">
        <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight text-church-blue sm:text-4xl">
          <AnimatedText text={t('contact.title')} lang={lang} />
        </h1>
      </header>

      <motion.div
        className="mb-8"
        style={{ willChange: 'transform' }}
        {...(reduced
          ? {}
          : {
              animate: { y: [0, -3, 0] },
              transition: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
            })}
      >
        <motion.div
          initial={{ opacity: 0, scaleX: reduced ? 1 : 0.9 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, delay: 0.28, ease: EASE }}
        >
          <CrossDivider opacity={0.28} />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-start md:gap-7 lg:gap-8">
        <motion.aside
          aria-label={t('contact.findUs')}
          className="min-w-0 rounded-2xl border border-white/5 bg-church-blue p-5 text-white shadow-card sm:p-6 md:col-span-5"
          {...revealProps(0.05)}
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="h-7 w-1 rounded-full bg-church-gold" aria-hidden="true" />
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-church-gold">
              {t('contact.findUs')}
            </p>
          </div>

          <Stagger className="space-y-3" staggerDelay={0.08}>
            <ContactInfoCard icon={MapPinIcon} label={t('contact.addressLabel')} reduced={reduced}>
              {churchInfo?.mapUrl ? (
                <a
                  href={churchInfo.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-sm leading-relaxed text-white/85 underline-offset-4 transition-colors hover:text-white hover:underline"
                >
                  {address}
                </a>
              ) : (
                <p className="mt-1 text-sm leading-relaxed text-white/85">{address}</p>
              )}
            </ContactInfoCard>

            <ContactInfoCard icon={PhoneIcon} label={t('contact.phoneLabel')} reduced={reduced}>
              <a
                href={`tel:${phone}`}
                className="mt-1 inline-block break-all text-sm font-medium text-white/90 transition-colors hover:text-church-gold"
              >
                {phone}
              </a>
            </ContactInfoCard>

            <ContactInfoCard icon={EnvelopeIcon} label={t('contact.emailLabel')} reduced={reduced}>
              <a
                href={`mailto:${email}`}
                className="mt-1 inline-block break-all text-sm font-medium text-white/90 transition-colors hover:text-church-gold"
              >
                {email}
              </a>
            </ContactInfoCard>

            <ContactInfoCard icon={ClockIcon} label={t('contact.serviceLabel')} reduced={reduced}>
              <p className="mt-1 text-sm font-medium text-white/90">{t('footer.everySunday')}</p>
            </ContactInfoCard>
          </Stagger>

          {churchInfo?.mapUrl && (
            <a
              href={churchInfo.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold group mt-4 h-10 w-full justify-center rounded-xl text-xs"
            >
              <span>{t('contact.getDirections')}</span>
              <ArrowRightIcon className={`h-3.5 w-3.5 ${reduced ? '' : 'transition-transform duration-300 group-hover:translate-x-0.5'}`} aria-hidden="true" />
            </a>
          )}
        </motion.aside>

        <Reveal delay={0.12} className="min-w-0 md:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="relative min-w-0 overflow-hidden rounded-2xl border border-church-border bg-white p-5 shadow-card sm:p-7"
          >
            <span className="absolute left-6 top-0 h-0.5 w-16 rounded-b-full bg-church-gold" aria-hidden="true" />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="contact-name" className="form-label">{t('contact.fullName')}</label>
                <input
                  {...field('name')}
                  autoComplete="name"
                  aria-required="true"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'contact-name-error' : undefined}
                  className={`${inputCls} ${errors.name ? 'border-red-400' : ''}`}
                  placeholder={t('contact.fullName').replace(' *', '')}
                />
                <FieldError id="contact-name-error" message={errors.name} reduced={reduced} />
              </div>

              <div>
                <label htmlFor="contact-email" className="form-label">{t('contact.email')}</label>
                <input
                  {...field('email')}
                  type="email"
                  autoComplete="email"
                  aria-required="true"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'contact-email-error' : undefined}
                  className={`${inputCls} ${errors.email ? 'border-red-400' : ''}`}
                  placeholder="your@email.com"
                />
                <FieldError id="contact-email-error" message={errors.email} reduced={reduced} />
              </div>

              <div>
                <label htmlFor="contact-phone" className="form-label">{t('contact.phone')}</label>
                <input
                  {...field('phone')}
                  type="tel"
                  autoComplete="tel"
                  className={inputCls}
                  placeholder="+91-..."
                />
              </div>

              <div>
                <label htmlFor="contact-subject" className="form-label">{t('contact.subject')}</label>
                <input
                  {...field('subject')}
                  className={inputCls}
                  placeholder={t('contact.subjectPlaceholder')}
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="contact-message" className="form-label">{t('contact.message')}</label>
              <textarea
                {...field('message')}
                rows={4}
                aria-required="true"
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? 'contact-message-error' : undefined}
                className={`${inputCls} min-h-[7.5rem] resize-none py-3 ${errors.message ? 'border-red-400' : ''}`}
                placeholder={t('contact.messagePlaceholder')}
              />
              <FieldError id="contact-message-error" message={errors.message} reduced={reduced} />
            </div>

            <div className="mt-5">
              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="btn-gold group h-11 w-full justify-center rounded-xl disabled:pointer-events-none disabled:opacity-60"
              >
                <span>{loading ? t('contact.sending') : t('contact.sendBtn')}</span>
                {loading ? (
                  <ArrowPathIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ArrowRightIcon className={`h-4 w-4 ${reduced ? '' : 'transition-transform duration-300 group-hover:translate-x-1'}`} aria-hidden="true" />
                )}
              </button>
            </div>
          </form>
        </Reveal>
      </div>
    </div>
  );
}
