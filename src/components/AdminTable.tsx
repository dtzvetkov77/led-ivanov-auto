type Column<T> = { key: keyof T | string; label: string; render?: (row: T) => React.ReactNode }
type Props<T> = { columns: Column<T>[]; rows: T[] }

export default function AdminTable<T extends { id: string }>({ columns, rows }: Props<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-surface-2">
          <tr>
            {columns.map(c => (
              <th key={String(c.key)} className="text-left px-4 py-3 text-muted font-medium">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id} className="border-t border-border hover:bg-surface transition-colors">
              {columns.map(c => (
                <td key={String(c.key)} className="px-4 py-3">
                  {c.render ? c.render(row) : String((row as Record<string, unknown>)[String(c.key)] ?? '')}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-muted">Няма записи</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
