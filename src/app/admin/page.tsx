import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata = { title: 'Admin | LED Ivanov Auto' }

export default async function AdminDashboard() {
  const supabase = await createClient()
  const [
    { count: orderCount },
    { count: productCount },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders')
      .select('id, order_number, customer_name, total, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const statusLabels: Record<string, string> = {
    new: 'Нова', confirmed: 'Потвърдена', shipped: 'Изпратена',
    delivered: 'Доставена', cancelled: 'Отказана',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Начало</h1>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          { label: 'Поръчки', value: orderCount ?? 0, href: '/admin/orders' },
          { label: 'Продукти', value: productCount ?? 0, href: '/admin/products' },
        ].map(s => (
          <Link key={s.label} href={s.href} className="bg-surface border border-border rounded-lg p-4 hover:border-accent transition-colors">
            <p className="text-muted text-sm">{s.label}</p>
            <p className="text-3xl font-black mt-1">{s.value}</p>
          </Link>
        ))}
      </div>
      <h2 className="font-semibold mb-3">Последни поръчки</h2>
      <div className="space-y-2">
        {recentOrders?.map(o => (
          <Link
            key={o.id}
            href={`/admin/orders/${o.id}`}
            className="flex items-center gap-4 bg-surface border border-border rounded-lg px-4 py-3 hover:border-accent transition-colors"
          >
            <span className="font-mono text-sm">{o.order_number}</span>
            <span className="flex-1 text-sm">{o.customer_name}</span>
            <span className="text-accent font-semibold">{Number(o.total).toFixed(2)} €</span>
            <span className="text-xs px-2 py-1 rounded bg-border-2 text-muted">
              {statusLabels[o.status] ?? o.status}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
