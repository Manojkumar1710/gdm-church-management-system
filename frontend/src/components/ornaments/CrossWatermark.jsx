/**
 * CrossWatermark
 * A large cross in a slightly lighter tone, for dark navy bands.
 * Positioned absolutely, behind content.
 *
 * Props:
 *   size      – default 320
 *   opacity   – default 0.06
 *   className – positioning wrapper
 */
export default function CrossWatermark({ size = 320, opacity = 0.06, className = '' }) {
  const arm = size * 0.12;   // arm thickness
  const cx  = size / 2;
  const cy  = size / 2;

  return (
    <div
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
      style={{ width: size, height: size, opacity }}
    >
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} xmlns="http://www.w3.org/2000/svg">
        {/* Vertical bar */}
        <rect x={cx - arm / 2} y={size * 0.08} width={arm} height={size * 0.84} fill="white" rx={arm / 4} />
        {/* Horizontal bar (slightly above center) */}
        <rect x={size * 0.08} y={cy - size * 0.18 - arm / 2} width={size * 0.84} height={arm} fill="white" rx={arm / 4} />
      </svg>
    </div>
  );
}
