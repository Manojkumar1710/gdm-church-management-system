/**
 * OliveBranch
 * A curved branch with muted olive-green leaves.
 *
 * Props:
 *   className – positioning wrapper
 *   flip      – boolean, mirrors the branch horizontally
 *   opacity   – default 0.18
 *   size      – default 220
 */
export default function OliveBranch({ className = '', flip = false, opacity = 0.18, size = 220 }) {
  return (
    <div
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        transform: flip ? 'scaleX(-1)' : undefined,
        opacity,
      }}
    >
      <svg viewBox="0 0 220 220" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Main stem */}
        <path
          d="M30 200 C60 160 90 120 130 80 C160 50 190 30 200 20"
          stroke="#6b7c3a"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Leaves along the branch */}
        {[
          { x: 60,  y: 165, r: -40 },
          { x: 80,  y: 145, r: -55 },
          { x: 100, y: 120, r: -50 },
          { x: 118, y: 100, r: -45 },
          { x: 138, y: 78,  r: -55 },
          { x: 158, y: 55,  r: -50 },
          { x: 178, y: 38,  r: -45 },
        ].map((l, i) => (
          <ellipse
            key={i}
            cx={l.x}
            cy={l.y}
            rx="13"
            ry="6"
            fill="#7a8c4a"
            opacity="0.75"
            transform={`rotate(${l.r}, ${l.x}, ${l.y})`}
          />
        ))}
        {/* Small berries */}
        {[
          { cx: 70,  cy: 158 },
          { cx: 110, cy: 112 },
          { cx: 150, cy: 62  },
        ].map((b, i) => (
          <circle key={i} cx={b.cx} cy={b.cy} r="3.5" fill="#6b7c3a" opacity="0.6" />
        ))}
      </svg>
    </div>
  );
}
