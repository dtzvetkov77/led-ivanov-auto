import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { path, referrer } = await req.json()
    if (!path || typeof path !== 'string') return NextResponse.json({}, { status: 400 })

    // Skip admin and API routes
    if (path.startsWith('/admin') || path.startsWith('/api')) {
      return NextResponse.json({})
    }

    const ua = req.headers.get('user-agent') ?? ''
    const device = /mobile|android|iphone|ipad/i.test(ua)
      ? 'mobile'
      : /tablet|ipad/i.test(ua) ? 'tablet' : 'desktop'

    const country =
      req.headers.get('x-vercel-ip-country') ??
      req.headers.get('cf-ipcountry') ??
      null

    const supabase = createServiceClient()
    await supabase.from('analytics_events').insert({
      path: path.slice(0, 500),
      referrer: referrer ? String(referrer).slice(0, 500) : null,
      device,
      country,
    })

    return NextResponse.json({})
  } catch {
    return NextResponse.json({})
  }
}
