import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * LightRays
 * 5 thin gold lines fanning from the top edge. For dark bands.
 * Fades in on mount.
 *
 * Props:
 *   width    – viewBox width (default 600)
 *   opacity  – default 0.12
 *   className
 */
export default function LightRays({ width = 600, opacity = 0.12, className = '' }) {
  const reduced = useReducedMotion();
  const h       = width * 0.55;

  // 5 rays fanning from the top-center
  const rays = [
    { x1: width * 0.5, y1: 0, x2: width * 0.05, y2: h },
    { x1: width * 0.5, y1: 0, x2: width * 0.25, y2: h },
    { x1: width * 0.5, y1: 0, x2: width * 0.5,  y2: h },
    { x1: width * 0.5, y1: 0, x2: width * 0.75, y2: h },
    { x1: width * 0.5, y1: 0, x2: width * 0.95, y2: h },
  ];

  return (
    <motion.div
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: reduced ? opacity : opacity }}
      transition={{ duration: 1.8, ease: 'easeOut' }}
      style={{ width, height: h }}
    >
      <svg viewBox={`0 0 ${width} ${h}`} width={width} height={h} fill="none" xmlns="http://www.w3.org/2000/svg">
        {rays.map((r, i) => (
          <line
            key={i}
            x1={r.x1} y1={r.y1}
            x2={r.x2} y2={r.y2}
            stroke="#c9a84c"
            strokeWidth={i === 2 ? 2 : 1}
            opacity={i === 2 ? 0.9 : 0.6}
          />
        ))}
      </svg>
    </motion.div>
  );
}
