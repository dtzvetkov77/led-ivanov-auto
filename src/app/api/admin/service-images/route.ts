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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const file = form.get('file') as File | null
  const service = form.get('service') as string | null
  const caption = form.get('caption') as string | null
  const position = parseInt(form.get('position') as string ?? '0', 10)

  if (!file || !service) return NextResponse.json({ error: 'Missing file or service' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `services/${service}/${Date.now()}.${ext}`

  const serviceClient = createServiceClient()
  const { error: uploadError } = await serviceClient.storage
    .from('product-images')
    .upload(path, buffer, { contentType: file.type || 'image/jpeg', upsert: true })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: urlData } = serviceClient.storage.from('product-images').getPublicUrl(path)
  const url = urlData.publicUrl

  const { data, error } = await supabase
    .from('service_images')
    .insert({ service, url, caption: caption || null, position })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
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
