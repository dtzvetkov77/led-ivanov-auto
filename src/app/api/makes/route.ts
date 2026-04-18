import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: makes } = await supabase.from('makes').select('id, name, slug').order('name')
  return NextResponse.json(makes ?? [])
}
