import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * PageTransition
 * Wraps page content in a simple fade-in on mount.
 * - No exit animation → navigation is instant, never flickers.
 * - No AnimatePresence needed.
 * - Keyed by location.pathname so a fresh fade fires on each route change.
 * - Movement (y offset) is skipped when prefers-reduced-motion is set.
 */
export default function PageTransition({ children }) {
  const location = useLocation();
  const reduced  = useReducedMotion();

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: reduced ? 0 : 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      style={{ willChange: 'opacity, transform' }}
    >
      {children}
    </motion.div>
  );
}
