import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  // Verify admin is logged in
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const file = form.get('file') as File | null
  const path = form.get('path') as string | null

  if (!file || !path) return NextResponse.json({ error: 'Missing file or path' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const contentType = file.type || 'image/jpeg'

  const service = createServiceClient()
  const { error } = await service.storage.from('product-images').upload(path, buffer, {
    contentType,
    upsert: true,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data } = service.storage.from('product-images').getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl })
}
