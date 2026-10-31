import { NextRequest, NextResponse } from 'next/server'
import { checkDiscountCode } from '@/lib/discountCodes'

export async function POST(req: NextRequest) {
  let code = ''
  try {
    const body = await req.json()
    code = typeof body?.code === 'string' ? body.code.slice(0, 50) : ''
  } catch {}
  const result = checkDiscountCode(code)
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ code: result.code, percent: result.percent })
}
