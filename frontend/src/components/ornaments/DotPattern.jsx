/**
 * DotPattern
 * A gold dot grid, used in corners of light sections.
 *
 * Props:
 *   cols, rows  – grid dimensions (default 6×6)
 *   gap         – spacing in px (default 18)
 *   r           – dot radius (default 1.5)
 *   opacity     – default 0.25
 *   className   – positioning wrapper
 */
export default function DotPattern({
  cols    = 6,
  rows    = 6,
  gap     = 18,
  r       = 1.5,
  opacity = 0.25,
  className = '',
}) {
  const w = (cols - 1) * gap + r * 2;
  const h = (rows - 1) * gap + r * 2;

  const dots = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      dots.push({ cx: col * gap + r, cy: row * gap + r });
    }
  }

  return (
    <div
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
      style={{ width: w, height: h, opacity }}
    >
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} fill="none" xmlns="http://www.w3.org/2000/svg">
        {dots.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r={r} fill="#c9a84c" />
        ))}
      </svg>
    </div>
  );
}
