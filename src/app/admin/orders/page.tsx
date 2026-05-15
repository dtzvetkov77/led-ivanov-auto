import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import DeleteOrderButton from '@/components/DeleteOrderButton'
import OrderStatusTabs from '@/components/OrderStatusTabs'

export const dynamic = 'force-dynamic'

const STATUS_LABELS: Record<string, string> = {
  new: 'Нова', confirmed: 'Потвърдена', shipped: 'Изпратена',
  delivered: 'Доставена', cancelled: 'Отказана',
}
const STATUS_COLORS: Record<string, string> = {
  new: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  confirmed: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  shipped: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  delivered: 'text-green-400 bg-green-400/10 border-green-400/20',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
}

type Props = { searchParams: Promise<{ status?: string }> }

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { status } = await searchParams
  const supabase = await createClient()

  let q = supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (status && status !== 'all') q = q.eq('status', status)

  const { data: orders } = await q

  // Counts per status for tab badges
  const { data: counts } = await supabase
    .from('orders')
    .select('status')

  const statusCounts: Record<string, number> = {}
  for (const o of counts ?? []) {
    statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1
  }
  const totalCount = (counts ?? []).length

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Поръчки</h1>

      <OrderStatusTabs active={status ?? 'all'} counts={statusCounts} total={totalCount} />

      {/* Mobile cards */}
      <div className="space-y-2 md:hidden">
        {(orders ?? []).length === 0 && (
          <p className="text-muted text-sm text-center py-8">Няма поръчки</p>
        )}
        {(orders ?? []).map(o => (
          <Link key={o.id} href={`/admin/orders/${o.id}`} className="block bg-surface border border-border rounded-xl p-4 hover:border-accent/50 transition-colors active:bg-surface/80">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="font-mono text-xs text-accent">#{o.order_number}</span>
                <p className="font-semibold text-sm mt-0.5">{o.customer_name}</p>
                <p className="text-xs text-muted">{o.customer_phone}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-black text-base">{Number(o.total).toFixed(2)} €</p>
                <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-1 ${STATUS_COLORS[o.status] ?? 'text-muted bg-border border-border'}`}>
                  {STATUS_LABELS[o.status] ?? o.status}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
              <span className="text-xs text-muted/60">
                {o.delivery_city} · {new Date(o.created_at).toLocaleDateString('bg-BG')}
              </span>
              <div onClick={e => e.preventDefault()}>
                <DeleteOrderButton orderId={o.id} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface-2">
            <tr>
              {['Номер', 'Клиент', 'Телефон', 'Град', 'Сума', 'Статус', 'Дата', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-muted font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-muted">Няма поръчки</td></tr>
            )}
            {(orders ?? []).map(o => (
              <tr key={o.id} className="border-t border-border hover:bg-surface transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="text-accent hover:underline font-mono">{o.order_number}</Link>
                </td>
                <td className="px-4 py-3">{o.customer_name}</td>
                <td className="px-4 py-3">{o.customer_phone}</td>
                <td className="px-4 py-3">{o.delivery_city}</td>
                <td className="px-4 py-3 font-semibold">{Number(o.total).toFixed(2)} €</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[o.status] ?? 'text-muted bg-border border-border'}`}>
                    {STATUS_LABELS[o.status] ?? o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">{new Date(o.created_at).toLocaleDateString('bg-BG')}</td>
                <td className="px-4 py-3"><DeleteOrderButton orderId={o.id} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
