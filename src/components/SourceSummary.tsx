import { describeSource, type TrafficSource } from '@/lib/traffic-source'

type Row = { status: string; total: number | string; created_at: string; source?: TrafficSource | null }

function group(orders: Row[]) {
  const map = new Map<string, { count: number; revenue: number }>()
  for (const o of orders) {
    const label = describeSource(o.source).label
    const g = map.get(label) ?? { count: 0, revenue: 0 }
    g.count += 1
    g.revenue += Number(o.total) || 0
    map.set(label, g)
  }
  return [...map.entries()].sort((a, b) => b[1].revenue - a[1].revenue)
}

function Table({ title, orders }: { title: string; orders: Row[] }) {
  const rows = group(orders)
  const total = orders.reduce((s, o) => s + (Number(o.total) || 0), 0)
  return (
    <div className="bg-surface border border-border rounded-lg p-4 min-w-0">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-semibold text-sm">{title}</h2>
        <span className="text-xs text-muted">{orders.length} поръчки · {total.toFixed(2)} €</span>
      </div>
      {rows.length === 0 && <p className="text-muted text-sm">Няма поръчки</p>}
      <div className="space-y-2">
        {rows.map(([label, g]) => (
          <div key={label} className="text-sm">
            <div className="flex justify-between gap-3">
              <span className="truncate">{label}</span>
              <span className="shrink-0 tabular-nums text-muted">{g.count} · <span className="text-white font-semibold">{g.revenue.toFixed(2)} €</span></span>
            </div>
            <div className="h-1 bg-surface-2 rounded mt-1 overflow-hidden">
              <div className="h-full bg-accent" style={{ width: `${total ? (g.revenue / total) * 100 : 0}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Orders and revenue per traffic source; cancelled orders are left out
export default function SourceSummary({ orders }: { orders: Row[] }) {
  const valid = orders.filter(o => o.status !== 'cancelled')
  // Server component on a force-dynamic page: evaluated once per request
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000 // eslint-disable-line react-hooks/purity
  const recent = valid.filter(o => new Date(o.created_at).getTime() >= cutoff)
  return (
    <div className="grid md:grid-cols-2 gap-3">
      <Table title="Източници · последни 30 дни" orders={recent} />
      <Table title="Източници · всички" orders={valid} />
    </div>
  )
}
