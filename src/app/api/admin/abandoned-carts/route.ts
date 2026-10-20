import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendAbandonedCartReminders } from '@/lib/abandonedCart'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

// Manual "send reminders now" from the admin
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    return NextResponse.json(await sendAbandonedCartReminders(createServiceClient()))
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
