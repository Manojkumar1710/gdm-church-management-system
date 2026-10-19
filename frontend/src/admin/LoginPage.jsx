import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EyeIcon, EyeSlashIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function LoginPage() {
  const { login, sessionExpired, returnTo } = useAuth();
  const { t }    = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Priority order for where to redirect after login:
   * 1. `returnTo` — set by AuthContext when a 401 fired mid-session.
   * 2. `location.state.from` — set by ProtectedRoute on first unauthenticated visit.
   * 3. Default dashboard.
   */
  const destination = returnTo
    || location.state?.from?.pathname
    || '/admin/dashboard';

  const [form,     setForm]     = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email.trim())    { setError(t('contact.errors.emailRequired')); return; }
    if (!form.password.trim()) { setError(`${t('admin.password')} is required.`);  return; }

    setLoading(true);
    const result = await login(form.email.trim(), form.password);
    setLoading(false);

    if (result.success) {
      navigate(destination, { replace: true });
    } else {
      setError(result.message || 'Invalid email or password. Please try again.');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #162d4a 60%, #0d1e31 100%)' }}
    >
      <div className="w-full max-w-sm">

        {/* ── Logo ────────────────────────────────── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                          bg-church-gold/20 border border-church-gold/30 mb-4">
            <span className="text-church-gold text-3xl">✝</span>
          </div>
          <h1 className="text-2xl font-bold text-white"
              style={{ fontFamily: 'Lora, Georgia, serif' }}>
            GDM Church
          </h1>
          <p className="text-white/50 text-sm mt-1">{t('admin.adminPanel')}</p>
          <div className="flex justify-center mt-3">
            <LanguageSwitcher />
          </div>
        </div>

        {/* ── Session-expired banner ───────────────── */}
        {sessionExpired && (
          <div
            className="mb-4 flex items-start gap-3 px-4 py-3.5 rounded-xl
                       bg-amber-500/15 border border-amber-400/40 text-amber-200"
            role="alert"
            aria-live="polite"
          >
            <ClockIcon className="h-5 w-5 shrink-0 mt-0.5 text-amber-300" aria-hidden="true" />
            <div>
              <p className="font-semibold text-sm text-amber-100 leading-tight mb-0.5">
                {t('admin.sessionExpiredTitle')}
              </p>
              <p className="text-xs text-amber-200/80 leading-snug">
                {t('admin.sessionExpired')}
              </p>
            </div>
          </div>
        )}

        {/* ── Card ────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Card header */}
          <div className="bg-church-blue px-6 py-4">
            <h2 className="text-white font-bold text-lg"
                style={{ fontFamily: 'Lora, Georgia, serif' }}>
              {t('admin.signIn')}
            </h2>
            <p className="text-white/55 text-xs mt-0.5">{t('admin.signInLabel')}</p>
          </div>

          {/* Form */}
          <div className="px-6 py-6">

            {/* Credential error banner */}
            {error && (
              <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl
                             bg-red-50 border border-red-200 text-red-700 text-sm">
                <span className="shrink-0 mt-0.5" aria-hidden="true">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>

              {/* Email */}
              <div>
                <label htmlFor="login-email" className="form-label">
                  {t('admin.email')}
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  spellCheck={false}
                  className="form-input"
                  placeholder="admin@gdmchurch.org"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className="form-label">
                  {t('admin.password')}
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="form-input pr-11"
                    placeholder={showPass ? 'Enter your password' : '••••••••••••'}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md
                               text-gray-400 hover:text-church-blue hover:bg-gray-100
                               transition-colors"
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass
                      ? <EyeSlashIcon className="h-5 w-5" />
                      : <EyeIcon      className="h-5 w-5" />
                    }
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-base rounded-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-white border-t-transparent
                                     rounded-full animate-spin" />
                    {t('admin.signingIn')}
                  </span>
                ) : (
                  t('admin.signIn')
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/35 text-xs mt-6">
          GDM Church {t('admin.adminPanel')} · {t('admin.authorised')}
        </p>
      </div>
    </div>
  );
}
