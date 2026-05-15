import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type Row = { key: string; total: number }
type Summary = {
  total: number
  by_day: Row[]
  by_path: Row[]
  by_referrer: Row[]
  by_device: Row[]
  by_country: Row[]
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const days = Math.min(parseInt(searchParams.get('days') ?? '30'), 90)
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const service = createServiceClient()

  const [{ data: summary, error }, { data: orders }] = await Promise.all([
    service.rpc('analytics_summary', { since_ts: since }) as unknown as Promise<{ data: Summary | null; error: unknown }>,
    supabase
      .from('orders')
      .select('total, created_at')
      .gte('created_at', since)
      .neq('status', 'cancelled'),
  ])

  if (error) return NextResponse.json({ error: String(error) }, { status: 500 })

  const s = summary ?? { total: 0, by_day: [], by_path: [], by_referrer: [], by_device: [], by_country: [] }

  // Process referrers: extract hostname from full URL
  const referrers: Row[] = (s.by_referrer ?? []).map(r => {
    let key = 'Директен'
    if (r.key) {
      try { key = new URL(r.key).hostname.replace('www.', '') } catch { key = r.key }
    }
    return { key, total: r.total }
  })
  // Merge duplicates after hostname extraction
  const refMap: Record<string, number> = {}
  for (const r of referrers) refMap[r.key] = (refMap[r.key] ?? 0) + r.total
  const mergedReferrers = Object.entries(refMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([key, total]) => ({ key, total }))

  // Revenue by day
  const revenueByDay: Record<string, number> = {}
  let totalRevenue = 0
  for (const o of (orders ?? [])) {
    const day = o.created_at.slice(0, 10)
    const val = Number(o.total)
    revenueByDay[day] = (revenueByDay[day] ?? 0) + val
    totalRevenue += val
  }
  const revenueSeries = Object.entries(revenueByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, total]) => ({ key, total }))

  return NextResponse.json({
    total: s.total,
    totalRevenue,
    orderCount: (orders ?? []).length,
    days,
    series: s.by_day ?? [],
    revenueSeries,
    pages: s.by_path ?? [],
    referrers: mergedReferrers,
    devices: s.by_device ?? [],
    countries: s.by_country ?? [],
  })
}
