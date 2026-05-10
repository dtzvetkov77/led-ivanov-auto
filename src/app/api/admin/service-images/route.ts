import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const service = req.nextUrl.searchParams.get('service')
  if (!service) return NextResponse.json({ error: 'Missing service' }, { status: 400 })

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('service_images')
    .select('*')
    .eq('service', service)
    .order('position')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Accept JSON payload with pre-uploaded URL (signed upload flow)
    const body = await req.json()
    const { url, service, caption, position } = body

    if (!url || !service) return NextResponse.json({ error: 'Missing url or service' }, { status: 400 })

    const { data, error } = await supabase
      .from('service_images')
      .insert({ service, url, caption: caption || null, position: position ?? 0 })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  const { error } = await supabase.from('service_images').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
