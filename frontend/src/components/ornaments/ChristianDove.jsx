/**
 * ChristianDove
 *
 * Renders the actual dove photograph asset (white dove with gold trim
 * carrying a green olive branch). No SVG hand-drawing — uses the real
 * image so it always looks exactly right.
 *
 * The source image has a white background. On cream / white page
 * sections it blends naturally. On dark navy backgrounds the `dark`
 * prop adds a subtle brightness so it stays visible.
 *
 * Props:
 *   size       – rendered width px (height scales automatically)
 *   className  – wrapper classes
 *   dark       – true on dark/navy backgrounds (slight brightness boost)
 *   withCircle / withMedallion – no-op, kept for API compat
 */
import doveImg from '../../assets/images/dove.png';

export default function ChristianDove({
  size          = 180,
  className     = '',
  dark          = false,
  // eslint-disable-next-line no-unused-vars
  withCircle    = false,
  // eslint-disable-next-line no-unused-vars
  withMedallion = false,
  // eslint-disable-next-line no-unused-vars
  gold,
  // eslint-disable-next-line no-unused-vars
  leaf,
}) {
  return (
    <div
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
      style={{ width: size, flexShrink: 0 }}
    >
      <img
        src={doveImg}
        alt=""
        aria-hidden="true"
        draggable="false"
        width={size}
        style={{
          width: size,
          height: 'auto',
          objectFit: 'contain',
          display: 'block',
          filter: dark
            ? 'brightness(1.15) drop-shadow(0 2px 8px rgba(0,0,0,0.25))'
            : 'none',
        }}
      />
    </div>
  );
}
