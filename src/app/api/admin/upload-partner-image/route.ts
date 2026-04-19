import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const file = form.get('file') as File | null
  const partnerId = form.get('partner_id') as string | null

  if (!file || !partnerId) return NextResponse.json({ error: 'Missing file or partner_id' }, { status: 400 })

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `partners/${partnerId}/${Date.now()}.${ext}`
  const bytes = await file.arrayBuffer()

  const service = createServiceClient()
  const { error } = await service.storage.from('product-images').upload(path, Buffer.from(bytes), {
    contentType: file.type || 'image/jpeg',
    upsert: true,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data } = service.storage.from('product-images').getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl })
}
