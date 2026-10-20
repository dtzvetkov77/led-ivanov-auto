import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { loadCustomers, segmentContext, SEGMENTS, toCustomerMatchCsv } from '@/lib/customerSegments'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const key = req.nextUrl.searchParams.get('segment') ?? 'all'
  const segment = SEGMENTS.find(s => s.key === key)
  if (!segment) return NextResponse.json({ error: 'Unknown segment' }, { status: 400 })

  const customers = await loadCustomers(supabase)
  const ctx = segmentContext(customers)
  const csv = toCustomerMatchCsv(customers.filter(c => segment.match(c, ctx)))
  const date = new Date().toISOString().slice(0, 10)

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="google-ads-${segment.key}-${date}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
