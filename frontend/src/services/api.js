import axios from 'axios';
import { SESSION_EXPIRED_EVENT } from '../context/AuthContext';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Attach JWT to every outbound request ────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gdm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Dedup guard — prevents multiple concurrent 401 responses from firing the
 * session-expired event more than once in the same navigation cycle.
 * Reset when the user logs in again (the flag lives only in module scope,
 * not in any React state, so it survives across re-renders but resets on
 * a fresh page load after login).
 */
let sessionExpiredFired = false;

/**
 * Call this after a successful login so the dedup guard is cleared,
 * allowing the next 401 to fire the event again.
 * Exported so AuthContext can call it after a successful login.
 */
export function resetSessionExpiredFlag() {
  sessionExpiredFired = false;
}

// ── Handle 401 globally ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // Only treat 401 as an auth failure. 403 (wrong role), network errors,
    // 5xx server errors, and cancellations are not auth failures.
    if (status === 401 && !sessionExpiredFired) {
      // Only intercept requests that originated from inside the admin area.
      // Public pages (contact form, prayer request, etc.) should never reach
      // here with a 401 because they send no token.
      const onAdminPage = window.location.pathname.startsWith('/admin');

      if (onAdminPage) {
        sessionExpiredFired = true;

        // Clear credentials from localStorage immediately so subsequent
        // requests also fail gracefully.
        localStorage.removeItem('gdm_token');
        localStorage.removeItem('gdm_user');

        // Fire a custom DOM event. AuthContext listens for it and:
        //   1. Sets sessionExpired = true  (shows the login-page banner)
        //   2. Sets returnTo = current path (restores location after login)
        // Using a custom event decouples the Axios layer from React state
        // and avoids a hard page reload, preserving the React Router context.
        window.dispatchEvent(
          new CustomEvent(SESSION_EXPIRED_EVENT, {
            detail: {
              returnTo: window.location.pathname + window.location.search,
            },
          })
        );
      }
    }

    return Promise.reject(error);
  }
);

export default api;
