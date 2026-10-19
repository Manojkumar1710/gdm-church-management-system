/**
 * CrossDivider
 * A gold line with a small cross-in-circle at the center.
 * Used between major sections.
 *
 * Props:
 *   className
 *   opacity – default 0.35
 */
export default function CrossDivider({ className = '', opacity = 0.35 }) {
  return (
    <div
      className={`pointer-events-none select-none flex items-center justify-center ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 320 28"
        width="320"
        height="28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity }}
      >
        {/* Left line */}
        <line x1="0" y1="14" x2="136" y2="14" stroke="#c9a84c" strokeWidth="1" />
        {/* Right line */}
        <line x1="184" y1="14" x2="320" y2="14" stroke="#c9a84c" strokeWidth="1" />
        {/* Circle */}
        <circle cx="160" cy="14" r="13" stroke="#c9a84c" strokeWidth="1.2" fill="none" />
        {/* Cross inside circle */}
        <line x1="160" y1="6"  x2="160" y2="22" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="152" y1="14" x2="168" y2="14" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
