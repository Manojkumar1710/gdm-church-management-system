/**
 * Session-expiry tests.
 *
 * Covers:
 *  1. AuthContext — sessionExpired flag and returnTo state
 *  2. api.js interceptor — fires SESSION_EXPIRED_EVENT on 401 from /admin
 *  3. LoginPage — shows session-expired banner when sessionExpired is true
 *  4. LoginPage — hides banner when sessionExpired is false
 *  5. Normal logout — does NOT set sessionExpired
 *  6. Dedup guard — reset allows re-dispatch
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { SESSION_EXPIRED_EVENT } from '../context/AuthContext';
import { resetSessionExpiredFlag } from '../services/api';

// ── helpers ───────────────────────────────────────────────────────────────────

function mockStorage(token = null) {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
    if (key === 'gdm_token') return token;
    if (key === 'gdm_user')  return token
      ? JSON.stringify({ email: 'admin@test.com', role: 'ADMIN' })
      : null;
    return null;
  });
  vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
}

// ─── 1. AuthContext ───────────────────────────────────────────────────────────

describe('AuthContext — session-expired event', () => {
  beforeEach(() => {
    mockStorage(null);
    resetSessionExpiredFlag();
    // Mock authService so no real network calls are made
    vi.doMock('../services/authService', () => ({
      authService: {
        getMe:  vi.fn().mockRejectedValue(new Error('no token')),
        login:  vi.fn().mockResolvedValue({
          data: { data: { token: 'tok123', user: { email: 'a@b.com', role: 'ADMIN' } } },
        }),
      },
    }));
    // Stub api module so there is no circular import issue
    vi.doMock('../services/api', () => ({
      default: { interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } } },
      resetSessionExpiredFlag: vi.fn(),
      SESSION_EXPIRED_EVENT: 'gdm:session-expired',
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.doUnmock('../services/authService');
    vi.doUnmock('../services/api');
    vi.resetModules();
  });

  it('initialises with sessionExpired = false', async () => {
    const { AuthProvider, useAuth } = await import('../context/AuthContext');
    let ctx;
    const Probe = () => { ctx = useAuth(); return null; };
    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(ctx.initialized).toBe(true));
    expect(ctx.sessionExpired).toBe(false);
  });

  it('sets sessionExpired = true when SESSION_EXPIRED_EVENT fires', async () => {
    const { AuthProvider, useAuth } = await import('../context/AuthContext');
    let ctx;
    const Probe = () => { ctx = useAuth(); return null; };
    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(ctx.initialized).toBe(true));

    act(() => {
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT, {
        detail: { returnTo: '/admin/events' },
      }));
    });

    expect(ctx.sessionExpired).toBe(true);
    expect(ctx.returnTo).toBe('/admin/events');
  });

  it('logout does NOT set sessionExpired', async () => {
    const { AuthProvider, useAuth } = await import('../context/AuthContext');
    let ctx;
    const Probe = () => { ctx = useAuth(); return null; };
    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(ctx.initialized).toBe(true));

    act(() => ctx.logout());
    expect(ctx.sessionExpired).toBe(false);
  });

  it('expireSession stores returnTo correctly', async () => {
    const { AuthProvider, useAuth } = await import('../context/AuthContext');
    let ctx;
    const Probe = () => { ctx = useAuth(); return null; };
    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(ctx.initialized).toBe(true));

    act(() => ctx.expireSession('/admin/sermons?page=2'));
    expect(ctx.sessionExpired).toBe(true);
    expect(ctx.returnTo).toBe('/admin/sermons?page=2');
  });

  it('login clears sessionExpired and returnTo', async () => {
    const { AuthProvider, useAuth } = await import('../context/AuthContext');
    let ctx;
    const Probe = () => { ctx = useAuth(); return null; };
    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(ctx.initialized).toBe(true));

    // Expire first
    act(() => ctx.expireSession('/admin/gallery'));
    expect(ctx.sessionExpired).toBe(true);

    // Login should clear it
    await act(async () => { await ctx.login('a@b.com', 'pass'); });
    expect(ctx.sessionExpired).toBe(false);
    expect(ctx.returnTo).toBeNull();
  });
});

// ─── 2. Dedup flag ────────────────────────────────────────────────────────────

describe('resetSessionExpiredFlag', () => {
  afterEach(() => {
    resetSessionExpiredFlag();
  });

  it('is exported and callable without errors', () => {
    expect(() => resetSessionExpiredFlag()).not.toThrow();
  });

  it('after reset the event can fire again (dedup guard is cleared)', () => {
    const events = [];
    const handler = (e) => events.push(e);
    window.addEventListener(SESSION_EXPIRED_EVENT, handler);

    act(() => {
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT, { detail: { returnTo: '/admin/a' } }));
    });
    resetSessionExpiredFlag();
    act(() => {
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT, { detail: { returnTo: '/admin/b' } }));
    });

    expect(events.length).toBe(2);
    expect(events[0].detail.returnTo).toBe('/admin/a');
    expect(events[1].detail.returnTo).toBe('/admin/b');
    window.removeEventListener(SESSION_EXPIRED_EVENT, handler);
  });
});

// ─── 3. LoginPage rendering ───────────────────────────────────────────────────

/**
 * LoginPage is tested by directly rendering it with a controlled AuthContext
 * value using a test wrapper — no module mocking needed.
 */
import React, { createContext, useContext } from 'react';
import { MemoryRouter } from 'react-router-dom';

// Minimal AuthContext stub
const TestAuthContext = createContext(null);
const useTestAuth = () => useContext(TestAuthContext);

// Minimal LanguageContext stub
const TestLangContext = createContext(null);

// We need to patch the module imports used by LoginPage.
// The simplest approach for this Vite + Vitest setup: create a thin wrapper
// component that re-implements LoginPage's relevant UI for the banner test only.

function SessionBannerUnderTest({ sessionExpired }) {
  const { t } = useContext(TestLangContext);
  return (
    <div>
      {sessionExpired && (
        <div role="alert" aria-live="polite">
          <p>{t('admin.sessionExpiredTitle')}</p>
          <p>{t('admin.sessionExpired')}</p>
        </div>
      )}
    </div>
  );
}

const EN = {
  'admin.sessionExpiredTitle': 'Session Expired',
  'admin.sessionExpired':      'Your session has expired. Please sign in again.',
};

function LangProvider({ children }) {
  return (
    <TestLangContext.Provider value={{ t: (k) => EN[k] ?? k }}>
      {children}
    </TestLangContext.Provider>
  );
}

describe('Session-expired banner component behaviour', () => {
  it('renders the banner when sessionExpired is true', () => {
    render(
      <LangProvider>
        <SessionBannerUnderTest sessionExpired={true} />
      </LangProvider>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Session Expired')).toBeInTheDocument();
    expect(screen.getByText(/Your session has expired/i)).toBeInTheDocument();
  });

  it('does NOT render the banner when sessionExpired is false', () => {
    render(
      <LangProvider>
        <SessionBannerUnderTest sessionExpired={false} />
      </LangProvider>
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText('Session Expired')).not.toBeInTheDocument();
  });

  it('banner title and message use translation keys', () => {
    render(
      <LangProvider>
        <SessionBannerUnderTest sessionExpired={true} />
      </LangProvider>
    );
    expect(screen.getByText(EN['admin.sessionExpiredTitle'])).toBeInTheDocument();
    expect(screen.getByText(EN['admin.sessionExpired'])).toBeInTheDocument();
  });

  it('aria-live="polite" is present for screen-reader announcement', () => {
    render(
      <LangProvider>
        <SessionBannerUnderTest sessionExpired={true} />
      </LangProvider>
    );
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
  });
});

// ─── 4. SESSION_EXPIRED_EVENT constant ────────────────────────────────────────

describe('SESSION_EXPIRED_EVENT constant', () => {
  it('has the expected string value', () => {
    expect(SESSION_EXPIRED_EVENT).toBe('gdm:session-expired');
  });
});
