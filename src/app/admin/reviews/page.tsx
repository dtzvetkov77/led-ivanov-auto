import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminReviewsPage() {
  const supabase = await createClient()
  const { data: reviews } = await supabase
    .from('customer_reviews')
    .select('*')
    .order('position')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Ревюта</h1>
        <Link href="/admin/reviews/new"
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
          </svg>
          Ново ревю
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface">
            <tr>
              <th className="text-left px-4 py-3 text-muted font-medium">Снимка</th>
              <th className="text-left px-4 py-3 text-muted font-medium">Клиент</th>
              <th className="text-left px-4 py-3 text-muted font-medium hidden sm:table-cell">Автомобил</th>
              <th className="text-left px-4 py-3 text-muted font-medium hidden md:table-cell">Текст</th>
              <th className="text-left px-4 py-3 text-muted font-medium">Статус</th>
              <th className="text-right px-4 py-3 text-muted font-medium">Действия</th>
            </tr>
          </thead>
          <tbody>
            {(reviews ?? []).map(r => (
              <tr key={r.id} className="border-t border-border hover:bg-surface/50 transition-colors">
                <td className="px-4 py-3">
                  {r.photo_url ? (
                    <img src={r.photo_url} alt={r.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                      {r.name[0]}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{r.name}</p>
                  <p className="text-yellow-400 text-xs">{'★'.repeat(r.stars)}</p>
                </td>
                <td className="px-4 py-3 text-muted hidden sm:table-cell">{r.car ?? '—'}</td>
                <td className="px-4 py-3 text-muted text-xs max-w-xs hidden md:table-cell">
                  <p className="line-clamp-2">{r.text}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${r.published ? 'bg-green-500/15 text-green-400' : 'bg-white/5 text-muted'}`}>
                    {r.published ? 'Публ.' : 'Скрито'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/reviews/${r.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface hover:bg-border border border-border transition-colors text-muted hover:text-white">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Редактирай
                  </Link>
                </td>
              </tr>
            ))}
            {!(reviews?.length) && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted">Няма ревюта</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
