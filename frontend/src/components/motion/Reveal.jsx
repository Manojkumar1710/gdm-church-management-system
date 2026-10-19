import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * Reveal
 * Fades in and rises 16 px when the element enters the viewport.
 * Uses whileInView + once:true so it only plays once per page load.
 * Skips movement (keeps fade only) when prefers-reduced-motion is set.
 *
 * Props:
 *   children   – content to reveal
 *   delay      – optional delay in seconds (default 0)
 *   duration   – animation duration in seconds (default 0.5)
 *   className  – wrapper className
 *   as         – element tag (default 'div')
 */
export default function Reveal({
  children,
  delay    = 0,
  duration = 0.5,
  className = '',
  as = 'div',
}) {
  const reduced = useReducedMotion();

  const variants = {
    hidden:  { opacity: 0, y: reduced ? 0 : 16 },
    visible: { opacity: 1, y: 0 },
  };

  const Tag = motion[as] || motion.div;

  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-48px' }}
      variants={variants}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </Tag>
  );
}
