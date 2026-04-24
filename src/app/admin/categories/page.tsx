import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Category } from '@/lib/types'

export default async function AdminCategoriesPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('*').order('name')
  const rows: Category[] = categories ?? []

  const byId = Object.fromEntries(rows.map(c => [c.id, c]))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Категории</h1>
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
          </svg>
          Нова категория
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface">
            <tr>
              <th className="text-left px-4 py-3 text-muted font-medium">Снимка</th>
              <th className="text-left px-4 py-3 text-muted font-medium">Наименование</th>
              <th className="text-left px-4 py-3 text-muted font-medium hidden sm:table-cell">Родител</th>
              <th className="text-left px-4 py-3 text-muted font-medium hidden sm:table-cell">Slug</th>
              <th className="text-right px-4 py-3 text-muted font-medium">Действия</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(cat => (
              <tr key={cat.id} className="border-t border-border hover:bg-surface/50 transition-colors">
                <td className="px-4 py-3">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="w-12 h-12 object-cover rounded-lg" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center text-muted">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                        <path d="M21 15l-5-5L5 21"/>
                      </svg>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-medium">
                  {cat.parent_id && <span className="text-muted mr-1">↳</span>}
                  {cat.name}
                </td>
                <td className="px-4 py-3 text-muted text-xs hidden sm:table-cell">
                  {cat.parent_id ? byId[cat.parent_id]?.name ?? '—' : '—'}
                </td>
                <td className="px-4 py-3 text-muted font-mono text-xs hidden sm:table-cell">{cat.slug}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/categories/${cat.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface hover:bg-border border border-border transition-colors text-muted hover:text-white"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Редактирай
                  </Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">Няма категории</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
