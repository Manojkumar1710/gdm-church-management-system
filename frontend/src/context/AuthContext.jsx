import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { resetSessionExpiredFlag } from '../services/api';

const AuthContext = createContext(null);

/**
 * Custom DOM event name fired by the Axios interceptor when a 401 is received
 * while the admin is inside the /admin section.
 *
 * The event carries:  { detail: { returnTo: string } }
 *   returnTo — the full path+search the admin was on so login can redirect back.
 */
export const SESSION_EXPIRED_EVENT = 'gdm:session-expired';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('gdm_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading,        setLoading]        = useState(false);
  const [initialized,    setInitialized]    = useState(false);
  /**
   * `sessionExpired` is true when the session was ended by a 401 from the server
   * (token expired or invalid) rather than by the admin clicking Sign Out.
   * The login page reads this flag to show the "session expired" banner.
   * It is reset to false as soon as the admin successfully logs in.
   */
  const [sessionExpired, setSessionExpired] = useState(false);
  /**
   * `returnTo` is the admin path the session expired on, so after re-login
   * the admin is sent back to the page they were using.
   */
  const [returnTo, setReturnTo] = useState(null);

  // ── Clear credentials (used by both logout and session-expiry) ──
  const clearCredentials = useCallback(() => {
    localStorage.removeItem('gdm_token');
    localStorage.removeItem('gdm_user');
    setUser(null);
  }, []);

  // ── Normal logout (admin clicked Sign Out) ─────────────────────
  const logout = useCallback(() => {
    clearCredentials();
    setSessionExpired(false);
    setReturnTo(null);
  }, [clearCredentials]);

  // ── Session expiry (server returned 401) ──────────────────────
  const expireSession = useCallback((path) => {
    clearCredentials();
    setSessionExpired(true);
    setReturnTo(path || null);
  }, [clearCredentials]);

  // ── Listen for the custom event fired by the Axios interceptor ─
  useEffect(() => {
    const handler = (e) => {
      const returnPath = e.detail?.returnTo || null;
      expireSession(returnPath);
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handler);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handler);
  }, [expireSession]);

  // ── Verify stored token is still valid on every mount ─────────
  useEffect(() => {
    const token = localStorage.getItem('gdm_token');
    if (token) {
      authService.getMe()
        .then((res) => setUser(res.data.data))
        .catch(() => {
          // Token was stored but the server now rejects it (expired or revoked).
          // Mark as session-expired so the login page shows the banner.
          expireSession(window.location.pathname + window.location.search);
        })
        .finally(() => setInitialized(true));
    } else {
      setInitialized(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Login ──────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      const { token, user: userData } = res.data.data;
      localStorage.setItem('gdm_token', token);
      localStorage.setItem('gdm_user', JSON.stringify(userData));
      setUser(userData);
      // Clear expiry state + dedup guard so the banner does not reappear
      setSessionExpired(false);
      setReturnTo(null);
      resetSessionExpiredFlag();
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const isAdmin              = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isTeacher            = user?.role === 'SUNDAY_SCHOOL_TEACHER';
  const canManageSundaySchool = isAdmin || isTeacher;

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      initialized,
      sessionExpired,
      returnTo,
      login,
      logout,
      expireSession,
      isAdmin,
      isTeacher,
      canManageSundaySchool,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
