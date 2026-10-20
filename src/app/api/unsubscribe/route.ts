import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { normalizeEmail } from '@/lib/customerSegments'
import { verifyUnsubscribe } from '@/lib/unsubscribe'

// One-click (List-Unsubscribe-Post) and the confirmation form on /unsubscribe both POST here.
export async function POST(req: NextRequest) {
  const email = normalizeEmail(req.nextUrl.searchParams.get('e'))
  const token = req.nextUrl.searchParams.get('t') ?? ''
  if (!email || !verifyUnsubscribe(email, token)) {
    return NextResponse.json({ error: 'Invalid link' }, { status: 400 })
  }

  const { error } = await createServiceClient()
    .from('email_unsubscribes')
    .upsert({ email }, { onConflict: 'email', ignoreDuplicates: true })
  if (error) return NextResponse.json({ error: 'Failed' }, { status: 500 })

  const fromForm = req.headers.get('content-type')?.includes('application/x-www-form-urlencoded')
    && req.nextUrl.searchParams.get('form') === '1'
  if (fromForm) return NextResponse.redirect(new URL('/unsubscribe?done=1', req.url), 303)
  return NextResponse.json({ ok: true })
}
