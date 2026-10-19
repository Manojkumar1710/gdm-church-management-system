import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * Stagger
 * Wraps a list of siblings and staggers their entrance animations.
 * Each direct child should use motion.div (or any motion element) with
 * variants named "hidden" / "visible" — Stagger propagates these automatically.
 *
 * Props:
 *   children     – motion-enabled child elements
 *   staggerDelay – seconds between each child's entrance (default 0.07)
 *   className    – wrapper className
 */
export default function Stagger({
  children,
  staggerDelay = 0.07,
  className    = '',
}) {
  const reduced = useReducedMotion();

  const container = {
    hidden:  {},
    visible: {
      transition: {
        staggerChildren: reduced ? 0 : staggerDelay,
      },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-48px' }}
      variants={container}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerItem
 * Use inside <Stagger> as a direct child.
 * Inherits the parent variants automatically.
 */
export function StaggerItem({ children, className = '' }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={{
        hidden:  { opacity: 0, y: reduced ? 0 : 16 },
        visible: { opacity: 1, y: 0,
          transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      {children}
    </motion.div>
  );
}
