'use client'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function PageTracker() {
  const pathname = usePathname()
  const lastPath = useRef<string | null>(null)

  useEffect(() => {
    if (pathname === lastPath.current) return
    const isFirst = lastPath.current === null
    lastPath.current = pathname

    const payload = JSON.stringify({
      path: pathname,
      referrer: isFirst ? document.referrer : '',
    })

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([payload], { type: 'application/json' }))
    } else {
      fetch('/api/track', { method: 'POST', body: payload, headers: { 'Content-Type': 'application/json' } }).catch(() => {})
    }
  }, [pathname])

  return null
}
