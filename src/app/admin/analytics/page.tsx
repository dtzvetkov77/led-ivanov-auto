'use client'
import { useEffect, useState, useCallback } from 'react'

type PageRow  = { key: string; total: number }
type RefRow   = { key: string; total: number }
type DevRow   = { key: string; total: number }
type DayRow   = { key: string; total: number; devices?: Record<string, number> }

type Data = {
  overview:  { data: DayRow[] }
  pages:     { data: PageRow[] }
  referrers: { data: RefRow[] }
  devices:   { data: DevRow[] }
  from: number; to: number; days: number
}

const RANGES = [
  { label: '7 дни',  value: 7 },
  { label: '30 дни', value: 30 },
  { label: '90 дни', value: 90 },
]

function Bar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="w-40 sm:w-56 shrink-0 truncate text-xs text-muted">{label}</div>
      <div className="flex-1 h-5 bg-border rounded-md overflow-hidden">
        <div className="h-full bg-accent/70 rounded-md transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="w-12 text-right text-xs font-semibold">{value.toLocaleString()}</div>
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
      const res = await fetch(`/api/admin/analytics?days=${d}`)
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Грешка')
      } else {
        setData(json)
      }
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(days) }, [days, load])

  const totalViews   = data?.overview?.data?.reduce((s, d) => s + (d.total ?? 0), 0) ?? 0
  const topPages     = data?.pages?.data ?? []
  const topReferrers = data?.referrers?.data ?? []
  const deviceRows   = data?.devices?.data ?? []
  const maxPage = topPages.reduce((m, r) => Math.max(m, r.total), 0)
  const maxRef  = topReferrers.reduce((m, r) => Math.max(m, r.total), 0)
  const maxDev  = deviceRows.reduce((m, r) => Math.max(m, r.total), 0)

  // Build chart series from overview time series
  const series = data?.overview?.data ?? []
  const maxDay = series.reduce((m, d) => Math.max(m, d.total ?? 0), 0)

  if (error === 'NO_TOKEN') {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
        </div>
        <h1 className="text-xl font-bold">Нужен е Vercel API Token</h1>
        <p className="text-sm text-muted leading-relaxed">
          За да видиш статистиките в админа, добави <code className="bg-border px-1.5 py-0.5 rounded text-accent text-xs">VERCEL_TOKEN</code> в environment variables.
        </p>
        <div className="bg-surface border border-border rounded-xl p-4 text-left space-y-2 text-xs text-muted">
          <p className="font-semibold text-white">Стъпки:</p>
          <ol className="list-decimal list-inside space-y-1.5">
            <li>Отиди на <span className="text-accent">vercel.com/account/tokens</span></li>
            <li>Създай нов token с name <em>ledivanov-admin</em></li>
            <li>Добави го в Vercel Dashboard → Settings → Environment Variables → <code className="bg-border px-1 rounded text-accent">VERCEL_TOKEN</code></li>
            <li>Redeploy проекта</li>
          </ol>
        </div>
        <a href="https://vercel.com/account/tokens" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
          Отвори Vercel Tokens
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Статистики</h1>
          <p className="text-xs text-muted mt-0.5">Vercel Web Analytics</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {RANGES.map(r => (
            <button
              key={r.value}
              onClick={() => setDays(r.value)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${days === r.value ? 'bg-accent text-white' : 'bg-border text-muted hover:text-white'}`}
            >
              {r.label}
            </button>
          ))}
          <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-border text-muted hover:text-white text-xs font-semibold transition-colors">
            Vercel
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
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

      {error && error !== 'NO_TOKEN' && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
          Грешка при зареждане: {error}
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-surface border border-border rounded-xl p-4">
              <p className="text-xs text-muted mb-1">Прегледи</p>
              <p className="text-2xl font-black">{totalViews.toLocaleString()}</p>
              <p className="text-xs text-muted/50 mt-0.5">последните {days} дни</p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4">
              <p className="text-xs text-muted mb-1">Топ страница</p>
              <p className="text-sm font-bold truncate">{topPages[0]?.key ?? '—'}</p>
              <p className="text-xs text-accent mt-0.5">{topPages[0]?.total?.toLocaleString() ?? '—'} прег.</p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4 col-span-2 sm:col-span-1">
              <p className="text-xs text-muted mb-1">Топ источник</p>
              <p className="text-sm font-bold truncate">{topReferrers[0]?.key || 'Директен'}</p>
              <p className="text-xs text-accent mt-0.5">{topReferrers[0]?.total?.toLocaleString() ?? '—'} посещ.</p>
            </div>
          </div>

          {/* Time series chart */}
          {series.length > 0 && (
            <div className="bg-surface border border-border rounded-xl p-4">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">Прегледи по дни</p>
              <div className="flex items-end gap-1 h-28">
                {series.map(d => {
                  const h = maxDay > 0 ? Math.max(4, (d.total / maxDay) * 100) : 4
                  const date = new Date(d.key)
                  const label = `${date.getDate()}/${date.getMonth() + 1}`
                  return (
                    <div key={d.key} className="flex-1 flex flex-col items-center gap-1 group" title={`${label}: ${d.total}`}>
                      <div
                        className="w-full bg-accent/60 hover:bg-accent rounded-t transition-all duration-300"
                        style={{ height: `${h}%` }}
                      />
                      {series.length <= 14 && (
                        <span className="text-[9px] text-muted/50 hidden sm:block">{label}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Top pages + referrers */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-surface border border-border rounded-xl p-4">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Топ страници</p>
              {topPages.length === 0
                ? <p className="text-xs text-muted/50">Няма данни</p>
                : topPages.map(r => <Bar key={r.key} label={r.key} value={r.total} max={maxPage} />)
              }
            </div>
            <div className="bg-surface border border-border rounded-xl p-4">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Източници</p>
              {topReferrers.length === 0
                ? <p className="text-xs text-muted/50">Няма данни</p>
                : topReferrers.map(r => <Bar key={r.key} label={r.key || 'Директен'} value={r.total} max={maxRef} />)
              }
            </div>
          </div>

          {/* Devices */}
          {deviceRows.length > 0 && (
            <div className="bg-surface border border-border rounded-xl p-4">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Устройства</p>
              {deviceRows.map(r => <Bar key={r.key} label={r.key} value={r.total} max={maxDev} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}
