/**
 * SectionHeader
 *
 * Props:
 *   title     – string (required)
 *   subtitle  – string (optional)
 *   className – extra wrapper classes
 *   light     – boolean (default false).
 *               Pass `light` when the section sits on a dark/navy background
 *               so the heading renders white instead of navy.
 *
 * Root cause of the Pastors-heading bug:
 *   .section-header h2 applies text-church-blue (#1e3a5f) which is invisible
 *   on the navy bg-church-blue band.  The `light` prop adds the CSS modifier
 *   class `section-header--light` which overrides to text-white.
 */
export default function SectionHeader({ title, subtitle, className = '', light = false }) {
  return (
    <div className={`section-header ${light ? 'section-header--light' : ''} ${className}`}>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}
