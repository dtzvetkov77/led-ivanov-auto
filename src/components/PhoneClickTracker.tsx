'use client'
import { useEffect } from 'react'
import { CONVERSIONS, trackConversion } from '@/lib/gtag'

// One delegated listener covers every tel: link on the site (banner, footer, contact, service pages)
export default function PhoneClickTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.('a[href^="tel:"]')
      if (!link) return
      trackConversion(CONVERSIONS.phoneClick, { phone: link.getAttribute('href')?.slice(4) })
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])
  return null
}
