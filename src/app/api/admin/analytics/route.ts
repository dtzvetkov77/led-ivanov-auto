import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const days = Math.min(parseInt(searchParams.get('days') ?? '30'), 90)
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const service = createServiceClient()
  const { data: events, error } = await service
    .from('analytics_events')
    .select('path, referrer, device, country, created_at')
    .gte('created_at', since)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = events ?? []

  // Aggregate
  const byDay: Record<string, number> = {}
  const byPath: Record<string, number> = {}
  const byRef: Record<string, number> = {}
  const byDevice: Record<string, number> = {}
  const byCountry: Record<string, number> = {}

  for (const e of rows) {
    const day = e.created_at.slice(0, 10)
    byDay[day] = (byDay[day] ?? 0) + 1
    byPath[e.path] = (byPath[e.path] ?? 0) + 1
    const ref = e.referrer ? new URL(e.referrer).hostname.replace('www.', '') : 'Директен'
    byRef[ref] = (byRef[ref] ?? 0) + 1
    if (e.device) byDevice[e.device] = (byDevice[e.device] ?? 0) + 1
    if (e.country) byCountry[e.country] = (byCountry[e.country] ?? 0) + 1
  }

  const sort = (obj: Record<string, number>) =>
    Object.entries(obj).sort((a, b) => b[1] - a[1]).map(([key, total]) => ({ key, total }))

  return NextResponse.json({
    total: rows.length,
    days,
    series: sort(byDay),
    pages: sort(byPath).slice(0, 10),
    referrers: sort(byRef).slice(0, 10),
    devices: sort(byDevice),
    countries: sort(byCountry).slice(0, 10),
  })
}
