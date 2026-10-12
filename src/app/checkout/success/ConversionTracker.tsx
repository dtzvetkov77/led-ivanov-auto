'use client'
import { useEffect } from 'react'

type Props = { orderNumber: string | null; value: number | null }

export default function ConversionTracker({ orderNumber, value }: Props) {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const gtag = (window as any).gtag
    if (typeof gtag === 'function') {
      gtag('event', 'conversion', {
        send_to: 'AW-18508516374/H_TrCJuanJodEJaYxvlE',
        value: value ?? 0,
        currency: 'EUR',
        transaction_id: orderNumber ?? '',
      })
    }
  }, [orderNumber, value])
  return null
}
