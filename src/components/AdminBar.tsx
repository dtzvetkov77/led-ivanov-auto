import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminBar({ productId }: { productId: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-3 px-4 py-3 bg-black/90 backdrop-blur-sm border-t border-accent/30">
      <div className="flex items-center gap-2 text-xs text-muted">
        <span className="w-2 h-2 rounded-full bg-accent inline-block" />
        Режим администратор
      </div>
      <div className="flex items-center gap-2">
        <Link
          href={`/admin/products/${productId}`}
          className="flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Редактирай
        </Link>
        <Link
          href="/admin/products"
          className="text-xs text-muted hover:text-white px-3 py-2 rounded-lg border border-border hover:border-accent/40 transition-colors"
        >
          Всички продукти
        </Link>
      </div>
    </div>
  )
}
