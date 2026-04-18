import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const makeSlug = req.nextUrl.searchParams.get('make')
  if (!makeSlug) return NextResponse.json([], { status: 200 })

  const supabase = await createClient()
  const { data: make } = await supabase
    .from('makes').select('id').eq('slug', makeSlug).single()
  if (!make) return NextResponse.json([])

  const { data, error } = await supabase
    .from('models').select('id, name').eq('make_id', make.id).order('name')
  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  return NextResponse.json(data)
}
