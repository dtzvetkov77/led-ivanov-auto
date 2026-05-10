import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin | LED Ivanov Auto' }

export default async function AdminDashboard() {
  const supabase = await createClient()
  const service = createServiceClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const last7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const last30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: orderCount },
    { count: productCount },
    { data: recentOrders },
    { data: thisMonthOrders },
    { data: lastMonthOrders },
    { count: todayVisits },
    { count: last7Visits },
    { count: last30Visits },
    newOrdersResult,
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders')
      .select('id, order_number, customer_name, total, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('orders')
      .select('total')
      .gte('created_at', startOfMonth)
      .neq('status', 'cancelled'),
    supabase.from('orders')
      .select('total')
      .gte('created_at', startOfLastMonth)
      .lte('created_at', endOfLastMonth)
      .neq('status', 'cancelled'),
    service.from('analytics_events').select('*', { count: 'exact', head: true }).gte('created_at', today),
    service.from('analytics_events').select('*', { count: 'exact', head: true }).gte('created_at', last7),
    service.from('analytics_events').select('*', { count: 'exact', head: true }).gte('created_at', last30),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'new'),
  ])

  const newOrderCount = newOrdersResult.count ?? 0

  const thisMonthRevenue = (thisMonthOrders ?? []).reduce((s, o) => s + Number(o.total), 0)
  const lastMonthRevenue = (lastMonthOrders ?? []).reduce((s, o) => s + Number(o.total), 0)
  const revenueChange = lastMonthRevenue > 0
    ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : null

  const statusLabels: Record<string, string> = {
    new: 'Нова', confirmed: 'Потвърдена', shipped: 'Изпратена',
    delivered: 'Доставена', cancelled: 'Отказана',
  }

  const statusColors: Record<string, string> = {
    new: 'text-yellow-400 bg-yellow-400/10',
    confirmed: 'text-blue-400 bg-blue-400/10',
    shipped: 'text-purple-400 bg-purple-400/10',
    delivered: 'text-green-400 bg-green-400/10',
    cancelled: 'text-red-400 bg-red-400/10',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Начало</h1>
        {(newOrderCount ?? 0) > 0 && (
          <Link href="/admin/orders?status=new" className="flex items-center gap-2 bg-accent/10 border border-accent/30 text-accent text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-accent/20 transition-colors">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            {newOrderCount} нови поръчки
          </Link>
        )}
      </div>

      {/* Revenue */}
      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Оборот</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-xs text-muted mb-1">Този месец</p>
            <p className="text-2xl font-black">{thisMonthRevenue.toFixed(2)} €</p>
            {revenueChange !== null && (
              <p className={`text-xs mt-1 font-semibold ${revenueChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {revenueChange >= 0 ? '▲' : '▼'} {Math.abs(revenueChange)}% спрямо миналия месец
              </p>
            )}
          </div>
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-xs text-muted mb-1">Миналия месец</p>
            <p className="text-2xl font-black">{lastMonthRevenue.toFixed(2)} €</p>
            <p className="text-xs text-muted/50 mt-1">{(lastMonthOrders ?? []).length} поръчки</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-xs text-muted mb-1">Поръчки общо</p>
            <p className="text-2xl font-black">{orderCount ?? 0}</p>
            <Link href="/admin/orders" className="text-xs text-accent hover:underline mt-1 block">Виж всички →</Link>
          </div>
        </div>
      </div>

      {/* Traffic */}
      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Посещения</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-xs text-muted mb-1">Днес</p>
            <p className="text-2xl font-black">{todayVisits ?? 0}</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-xs text-muted mb-1">7 дни</p>
            <p className="text-2xl font-black">{last7Visits ?? 0}</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-xs text-muted mb-1">30 дни</p>
            <p className="text-2xl font-black">{last30Visits ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/admin/products" className="bg-surface border border-border rounded-xl p-4 hover:border-accent transition-colors">
          <p className="text-xs text-muted mb-1">Продукти</p>
          <p className="text-2xl font-black">{productCount ?? 0}</p>
        </Link>
        <Link href="/admin/analytics" className="bg-surface border border-accent/30 rounded-xl p-4 hover:border-accent transition-colors">
          <p className="text-xs text-accent mb-1">Статистики →</p>
          <p className="text-sm text-muted">Детайли за трафика</p>
        </Link>
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">Последни поръчки</h2>
          <Link href="/admin/orders" className="text-xs text-accent hover:underline">Всички →</Link>
        </div>
        <div className="space-y-2">
          {recentOrders?.map(o => (
            <Link
              key={o.id}
              href={`/admin/orders/${o.id}`}
              className="flex items-center gap-3 bg-surface border border-border rounded-xl px-4 py-3 hover:border-accent transition-colors"
            >
              <span className="font-mono text-xs text-muted shrink-0">#{o.order_number}</span>
              <span className="flex-1 text-sm truncate">{o.customer_name}</span>
              <span className="text-accent font-bold text-sm shrink-0">{Number(o.total).toFixed(2)} €</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusColors[o.status] ?? 'bg-border text-muted'}`}>
                {statusLabels[o.status] ?? o.status}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
