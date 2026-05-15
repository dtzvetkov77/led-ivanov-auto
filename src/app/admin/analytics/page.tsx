'use client'
import { useEffect, useState, useCallback, useRef } from 'react'

type Row = { key: string; total: number }
type Data = {
  total: number
  totalRevenue: number
  orderCount: number
  days: number
  series: Row[]
  revenueSeries: Row[]
  pages: Row[]
  referrers: Row[]
  devices: Row[]
  countries: Row[]
}

const RANGES = [
  { label: '7 дни',  value: 7 },
  { label: '30 дни', value: 30 },
  { label: '90 дни', value: 90 },
]

function Bars({ rows }: { rows: Row[] }) {
  const max = rows.reduce((m, r) => Math.max(m, r.total), 0)
  return (
    <div className="space-y-1">
      {rows.map(r => (
        <div key={r.key} className="flex items-center gap-3 py-1">
          <div className="w-24 sm:w-44 shrink-0 truncate text-xs text-muted">{r.key}</div>
          <div className="flex-1 h-5 bg-border rounded overflow-hidden">
            <div
              className="h-full bg-accent/70 rounded transition-all duration-500"
              style={{ width: max > 0 ? `${(r.total / max) * 100}%` : '0%' }}
            />
          </div>
          <div className="w-10 text-right text-xs font-semibold shrink-0">{r.total}</div>
        </div>
      ))}
    </div>
  )
}

function BarChart({ rows, color, formatValue }: { rows: Row[]; color: string; formatValue: (v: number) => string }) {
  const [active, setActive] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const max = rows.reduce((m, r) => Math.max(m, r.total), 0)

  useEffect(() => {
    const handler = () => setActive(null)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  const showDates = rows.length <= 14
  const showEveryN = rows.length > 14 ? Math.ceil(rows.length / 10) : 1

  return (
    <div ref={containerRef} className="relative h-32 flex items-end gap-px">
      {rows.map((d, i) => {
        const pct = max > 0 ? Math.max(4, (d.total / max) * 100) : 4
        const [, mm, dd] = d.key.split('-')
        const isActive = active === i
        return (
          <div
            key={d.key}
            className="flex-1 flex flex-col justify-end h-full group cursor-pointer relative"
            onClick={e => { e.stopPropagation(); setActive(isActive ? null : i) }}
          >
            {/* Tooltip */}
            {isActive && (
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-10 bg-white text-black text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none">
                {dd}/{mm}: {formatValue(d.total)}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
              </div>
            )}
            <div
              className={`w-full rounded-sm transition-colors ${isActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}
              style={{ height: `${pct}%`, background: color }}
            />
            {showDates && i % showEveryN === 0 && (
              <span className="text-[8px] text-muted/50 text-center mt-0.5 leading-none">{dd}/{mm}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState(30)
  const [data, setData] = useState<Data | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (d: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/analytics?days=${d}`, { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) setError(json.error ?? 'Грешка')
      else setData(json)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(days) }, [days, load])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Статистики</h1>
          <p className="text-xs text-muted mt-0.5">Посещения на сайта</p>
        </div>
        <div className="flex items-center gap-2">
          {RANGES.map(r => (
            <button
              key={r.value}
              onClick={() => setDays(r.value)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${days === r.value ? 'bg-accent text-white' : 'bg-border text-muted hover:text-white'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-40 text-muted text-sm gap-2">
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
          Зареждане...
        </div>
      )}

      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">{error}</div>}

      {!loading && !error && data && (
        <>
          {/* Revenue KPI */}
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">Оборот</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-surface border border-accent/20 rounded-xl p-4">
                <p className="text-xs text-muted mb-1">Приходи</p>
                <p className="text-2xl font-black text-accent">{data.totalRevenue.toFixed(2)} €</p>
                <p className="text-xs text-muted/50 mt-0.5">последните {days} дни</p>
              </div>
              <div className="bg-surface border border-border rounded-xl p-4">
                <p className="text-xs text-muted mb-1">Поръчки</p>
                <p className="text-2xl font-black">{data.orderCount}</p>
                <p className="text-xs text-muted/50 mt-0.5">без отказани</p>
              </div>
              <div className="bg-surface border border-border rounded-xl p-4 col-span-2 sm:col-span-1">
                <p className="text-xs text-muted mb-1">Средна поръчка</p>
                <p className="text-2xl font-black">
                  {data.orderCount > 0 ? (data.totalRevenue / data.orderCount).toFixed(2) : '0.00'} €
                </p>
              </div>
            </div>
          </div>

          {/* Revenue chart */}
          {data.revenueSeries.length > 0 && (
            <div className="bg-surface border border-border rounded-xl p-4">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">Оборот по дни</p>
              <BarChart rows={data.revenueSeries} color="#22c55e" formatValue={v => `${v.toFixed(2)} €`} />
            </div>
          )}

          {/* Traffic KPI */}
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">Трафик</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-surface border border-border rounded-xl p-4 col-span-2 sm:col-span-1">
                <p className="text-xs text-muted mb-1">Общо прегледи</p>
                <p className="text-3xl font-black">{data.total.toLocaleString()}</p>
                <p className="text-xs text-muted/50 mt-0.5">последните {days} дни</p>
              </div>
              <div className="bg-surface border border-border rounded-xl p-4">
                <p className="text-xs text-muted mb-1">Топ страница</p>
                <p className="text-sm font-bold truncate">{data.pages[0]?.key ?? '—'}</p>
                <p className="text-xs text-accent mt-0.5">{data.pages[0]?.total ?? 0} прег.</p>
              </div>
              <div className="bg-surface border border-border rounded-xl p-4">
                <p className="text-xs text-muted mb-1">Топ источник</p>
                <p className="text-sm font-bold truncate">{data.referrers[0]?.key ?? '—'}</p>
                <p className="text-xs text-accent mt-0.5">{data.referrers[0]?.total ?? 0} посещ.</p>
              </div>
              <div className="bg-surface border border-border rounded-xl p-4">
                <p className="text-xs text-muted mb-1">Мобилни</p>
                <p className="text-3xl font-black">
                  {data.total > 0
                    ? Math.round(((data.devices.find(d => d.key === 'mobile')?.total ?? 0) / data.total) * 100)
                    : 0}%
                </p>
                <p className="text-xs text-muted/50 mt-0.5">от всички</p>
              </div>
            </div>
          </div>

          {/* Chart */}
          {data.series.length > 0 && (
            <div className="bg-surface border border-border rounded-xl p-4">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">Прегледи по дни</p>
              <BarChart rows={data.series} color="var(--color-accent)" formatValue={v => `${v} прег.`} />
            </div>
          )}

          {/* Tables */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-surface border border-border rounded-xl p-4">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Топ страници</p>
              {data.pages.length === 0
                ? <p className="text-xs text-muted/40">Няма данни</p>
                : <Bars rows={data.pages} />}
            </div>
            <div className="bg-surface border border-border rounded-xl p-4">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Източници</p>
              {data.referrers.length === 0
                ? <p className="text-xs text-muted/40">Няма данни</p>
                : <Bars rows={data.referrers} />}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-surface border border-border rounded-xl p-4">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Устройства</p>
              {data.devices.length === 0
                ? <p className="text-xs text-muted/40">Няма данни</p>
                : <Bars rows={data.devices} />}
            </div>
            {data.countries.length > 0 && (
              <div className="bg-surface border border-border rounded-xl p-4">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Държави</p>
                <Bars rows={data.countries} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
