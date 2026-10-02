import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();
  const from        = location.state?.from?.pathname || '/admin/dashboard';

  const [form,        setForm]        = useState({ email: '', password: '' });
  const [showPass,    setShowPass]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email.trim())    { setError('Email address is required.');  return; }
    if (!form.password.trim()) { setError('Password is required.');        return; }

    setLoading(true);
    const result = await login(form.email.trim(), form.password);
    setLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
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

        {/* ── Logo ─────────────────────────────────── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-church-gold/20 border border-church-gold/30 mb-4">
            <span className="text-church-gold text-3xl">✝</span>
          </div>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: 'Lora, Georgia, serif' }}
          >
            GDM Church
          </h1>
          <p className="text-white/50 text-sm mt-1">Administration Panel</p>
        </div>

        {/* ── Card ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Card header strip */}
          <div className="bg-church-blue px-6 py-4">
            <h2
              className="text-white font-bold text-lg"
              style={{ fontFamily: 'Lora, Georgia, serif' }}
            >
              Sign In
            </h2>
            <p className="text-white/55 text-xs mt-0.5">Enter your admin credentials to continue</p>
          </div>

          {/* Form */}
          <div className="px-6 py-6">

            {/* Error banner */}
            {error && (
              <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>

              {/* Email */}
              <div>
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <input
                  id="email"
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

              {/* Password with show/hide */}
              <div>
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="form-input pr-11"
                    placeholder={showPass ? 'Enter your password' : '••••••••••••'}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  />
                  {/* Toggle button */}
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-church-blue hover:bg-gray-100 transition-colors"
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass
                      ? <EyeSlashIcon className="h-5 w-5" />
                      : <EyeIcon      className="h-5 w-5" />
                    }
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  Click the eye icon to show or hide your password.
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-base rounded-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-white/35 text-xs mt-6">
          GDM Church Administration Panel · Authorised access only
        </p>
      </div>
    </div>
  );
}
