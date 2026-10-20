import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'node:crypto'
import { createServiceClient } from '@/lib/supabase/server'
import { normalizeEmail } from '@/lib/customerSegments'
import { validateCartItems } from '@/lib/abandonedCart'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
/** New carts allowed per IP per 24h — real shoppers need 1-2; caps bulk abuse.
 * Fast path only; the atomic limit is the DB trigger in migration 019. */
const MAX_NEW_CARTS_PER_IP = 3

function ipHash(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  return createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').update(ip).digest('hex').slice(0, 32)
}

// Checkout saves the cart once a valid email is entered, for the abandoned-cart reminder
export async function POST(req: NextRequest) {
  let body: { id?: unknown; email?: unknown; items?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }
  const id = typeof body.id === 'string' && UUID.test(body.id) ? body.id : null
  const email = normalizeEmail(typeof body.email === 'string' ? body.email.slice(0, 200) : null)
  if (!id || !email) return NextResponse.json({ error: 'Invalid' }, { status: 400 })

  const service = createServiceClient()
  const items = await validateCartItems(service, body.items)
  if (!items.length) return NextResponse.json({ ok: true })

  const { data: existing } = await service.from('abandoned_carts').select('recovered_at').eq('id', id).maybeSingle()
  if (existing?.recovered_at) return NextResponse.json({ ok: true })

  // Per-IP cap on new carts; silently ignore beyond it
  const ip_hash = ipHash(req)
  if (!existing) {
    const { count } = await service
      .from('abandoned_carts')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ip_hash)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    if ((count ?? 0) >= MAX_NEW_CARTS_PER_IP) return NextResponse.json({ ok: true })
  }

  const { error } = await service.from('abandoned_carts').upsert({
    id,
    email,
    ip_hash,
    items,
    total: items.reduce((s, i) => s + i.price * i.qty, 0),
    updated_at: new Date().toISOString(),
  })
  if (error) {
    if (error.message.includes('cart_ip_cap')) return NextResponse.json({ ok: true })
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

// Restore link from the reminder email — the id is an unguessable UUID; only cart items are returned
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id') ?? ''
  if (!UUID.test(id)) return NextResponse.json({ error: 'Invalid' }, { status: 400 })
  const { data } = await createServiceClient().from('abandoned_carts').select('items').eq('id', id).maybeSingle()
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ items: data.items }, { headers: { 'Cache-Control': 'no-store' } })
}
