'use client'
import { useEffect } from 'react'

export default function ConversionTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const gtag = (window as any).gtag
    if (typeof gtag === 'function') {
      gtag('event', 'conversion', { send_to: 'AW-18272364793' })
    }
  }, [])
  return null
}
