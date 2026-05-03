import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

type Props = { params: Promise<{ id: string }> }

export async function DELETE(_req: NextRequest, { params }: Props) {
  const { id } = await params
  const supabase = createServiceClient()
  const { error } = await supabase.from('orders').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
