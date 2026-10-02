export default function SectionHeader({ title, subtitle, className = '' }) {
  return (
    <div className={`section-header ${className}`}>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}
