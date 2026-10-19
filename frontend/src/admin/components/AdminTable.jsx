import { RectangleGroupIcon } from '@heroicons/react/24/outline';
import { TableRowSkeleton } from '../../components/Skeleton';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Generic admin data table.
 * Props:
 *   columns  – array of { key, label, render? }
 *   rows     – data array
 *   loading  – boolean
 *   onEdit   – (row) => void   (optional)
 *   onDelete – (row) => void   (optional)
 *   actions  – extra (row) => JSX  (optional)
 */
export default function AdminTable({ columns, rows, loading, onEdit, onDelete, actions, emptyMessage, editLabel }) {
  const { t } = useLanguage();
  const empty = emptyMessage ?? t('admin.empty.generic');
  const hasActions = Boolean(onEdit || onDelete || actions);

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} scope="col">{col.label}</th>
            ))}
            {hasActions && (
              <th scope="col" className="text-right">
                <span className="sr-only">{editLabel ?? t('common.edit')}</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRowSkeleton key={i} cols={columns.length + (hasActions ? 1 : 0)} />
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (hasActions ? 1 : 0)}>
                <div className="empty-state">
                  <span className="empty-state__icon">
                    <RectangleGroupIcon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <p className="empty-state__text">{empty}</p>
                </div>
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={row.id ?? i}>
                {columns.map(col => (
                  <td key={col.key}>
                    {col.render ? col.render(row) : row[col.key] ?? '—'}
                  </td>
                ))}
                {hasActions && (
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {actions?.(row)}
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(row)}
                          className="admin-btn"
                        >
                          {editLabel ?? t('common.edit')}
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(row)}
                          className="admin-btn admin-btn--danger"
                        >
                          {t('common.delete')}
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
