/**
 * CrossBible
 *
 * Renders the golden cross + open Bible + olive branches asset.
 * Has a warm cream/white background — blends well on light sections.
 * Use as a hero background accent, section banner, or panel image.
 *
 * Props:
 *   size      – rendered width px (height auto)
 *   className – wrapper classes
 */
import crossImg from '../../assets/images/cross-bible.png';

export default function CrossBible({
  size      = 280,
  className = '',
}) {
  return (
    <div
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
      style={{ width: size, flexShrink: 0 }}
    >
      <img
        src={crossImg}
        alt=""
        aria-hidden="true"
        draggable="false"
        width={size}
        style={{
          width: size,
          height: 'auto',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </div>
  );
}
