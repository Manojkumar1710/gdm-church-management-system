import { TableRowSkeleton } from '../../components/Skeleton';

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
export default function AdminTable({ columns, rows, loading, onEdit, onDelete, actions, emptyMessage = 'No records found.' }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            {columns.map(col => (
              <th key={col.key} className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">
                {col.label}
              </th>
            ))}
            {(onEdit || onDelete || actions) && (
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRowSkeleton key={i} cols={columns.length + 1} />
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="text-center py-12 text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={row.id ?? i} className="hover:bg-gray-50 transition-colors">
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.key] ?? '—'}
                  </td>
                ))}
                {(onEdit || onDelete || actions) && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {actions?.(row)}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="px-3 py-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-medium"
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="px-3 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100 text-xs font-medium"
                        >
                          Delete
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
