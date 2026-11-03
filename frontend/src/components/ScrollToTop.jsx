import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop
 *
 * Resets the browser scroll position to the top of the page (0, 0) on every
 * route change. Must be rendered inside <BrowserRouter> so it can read the
 * current location. Renders nothing to the DOM.
 *
 * Why window.scrollTo instead of a ref:
 *   PublicLayout uses a standard flow layout — the whole page scrolls via
 *   window, not a custom overflow container. Resetting window is therefore
 *   the correct target. The fixed navbar is never scrolled.
 *
 * Why pathname only (not the full location object):
 *   We only want to reset on actual page navigations. Hash-link jumps within
 *   a page and search-param changes (e.g. pagination ?page=2) should not
 *   force a scroll reset, so we depend only on pathname.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 'instant' avoids the brief smooth-scroll animation that can make the
    // reset visible as a flash of motion on fast navigations.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
