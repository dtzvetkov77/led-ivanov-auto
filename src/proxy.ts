import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Rate limiting for /api/orders (10 req/min per IP)
const ipCounts = new Map<string, { count: number; reset: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = ipCounts.get(ip)
  if (!entry || now > entry.reset) {
    ipCounts.set(ip, { count: 1, reset: now + 60_000 })
    return true
  }
  if (entry.count >= 10) return false
  entry.count++
  return true
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Rate limit order submissions
  if (pathname === '/api/orders' && req.method === 'POST') {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Твърде много заявки' }, { status: 429 })
    }
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const res = NextResponse.next()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => req.cookies.getAll(),
          setAll: (cookies) => cookies.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
        },
      }
    )
    const { data: { session } } = await supabase.auth.getSession()
    const isLoginPage = pathname === '/admin/login'
    if (!session && !isLoginPage) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    if (session && isLoginPage) {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/orders'],
}
