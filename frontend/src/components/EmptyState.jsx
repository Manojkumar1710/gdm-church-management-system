import DoveMedallion from './ornaments/DoveMedallion';

/**
 * EmptyState
 * Shown when a list / page has no data yet.
 * Keeps existing props: title, message, icon (ignored — replaced by DoveMedallion),
 * action.
 * Admin panel: DoveMedallion is shown here too (dark=false is fine on white bg).
 */
export default function EmptyState({
  title   = 'Nothing here yet',
  message,
  icon: _Icon,   // kept for API compat but DoveMedallion replaces it
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <DoveMedallion size={120} className="mb-4 opacity-75" />
      <h3 className="text-lg font-semibold text-gray-600 mb-1.5">{title}</h3>
      {message && (
        <p className="text-gray-400 text-sm max-w-xs leading-relaxed">{message}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
