import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

async function uploadImage(file: File, service: string, suffix: string): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `services/${service}/before-after/${Date.now()}-${suffix}.${ext}`
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const serviceClient = createServiceClient()
  const { error } = await serviceClient.storage
    .from('product-images')
    .upload(path, buffer, { contentType: file.type || 'image/jpeg', upsert: true })
  if (error) throw new Error(error.message)
  const { data } = serviceClient.storage.from('product-images').getPublicUrl(path)
  return data.publicUrl
}

export async function GET(req: NextRequest) {
  const service = req.nextUrl.searchParams.get('service') ?? 'headlight-polishing'
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('service_before_after')
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

    // Accept JSON payload with pre-uploaded URLs (signed upload flow)
    const body = await req.json()
    const { before_url, after_url, label, service, position } = body

    if (!before_url || !after_url) {
      return NextResponse.json({ error: 'Missing before_url or after_url' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('service_before_after')
      .insert({
        service: service || 'headlight-polishing',
        before_url,
        after_url,
        label: label || null,
        position: position ?? 0,
        published: true,
      })
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
  const { error } = await supabase.from('service_before_after').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
