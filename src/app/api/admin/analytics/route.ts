import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const VERCEL_API = 'https://api.vercel.com'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const token = process.env.VERCEL_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID
  const teamId = process.env.VERCEL_TEAM_ID

  if (!token) return NextResponse.json({ error: 'NO_TOKEN' }, { status: 503 })
  if (!projectId) return NextResponse.json({ error: 'NO_PROJECT_ID' }, { status: 503 })

  const { searchParams } = new URL(req.url)
  const days = Math.min(parseInt(searchParams.get('days') ?? '30'), 90)
  const now = Date.now()
  const from = now - days * 24 * 60 * 60 * 1000

  const headers = { Authorization: `Bearer ${token}` }
  const team = teamId ? `&teamId=${teamId}` : ''
  const base = `${VERCEL_API}/v1/web/analytics?projectId=${projectId}&from=${from}&to=${now}&environment=production${team}`

  const [overviewRes, pagesRes, referrersRes, devicesRes] = await Promise.all([
    fetch(`${base}&granularity=day`, { headers }),
    fetch(`${VERCEL_API}/v1/web/analytics/pages?projectId=${projectId}&from=${from}&to=${now}&limit=10${team}`, { headers }),
    fetch(`${VERCEL_API}/v1/web/analytics/referrers?projectId=${projectId}&from=${from}&to=${now}&limit=10${team}`, { headers }),
    fetch(`${VERCEL_API}/v1/web/analytics/devices?projectId=${projectId}&from=${from}&to=${now}${team}`, { headers }),
  ])

  const [overview, pages, referrers, devices] = await Promise.all([
    overviewRes.json(),
    pagesRes.json(),
    referrersRes.json(),
    devicesRes.json(),
  ])

  return NextResponse.json({ overview, pages, referrers, devices, from, to: now, days })
}
