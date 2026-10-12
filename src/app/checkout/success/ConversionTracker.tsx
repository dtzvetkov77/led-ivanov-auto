'use client'
import { useEffect } from 'react'

type Props = { orderNumber: string | null }

// Total stored by CheckoutForm in sessionStorage, only if it belongs to this order
function readOrderTotal(orderNumber: string | null): number {
  if (!orderNumber) return 0
  try {
    const last = JSON.parse(sessionStorage.getItem('last_order') ?? 'null')
    if (last?.order_number === orderNumber) return Number(last.total) || 0
  } catch {}
  return 0
}

export default function ConversionTracker({ orderNumber }: Props) {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const gtag = (window as any).gtag
    if (typeof gtag === 'function') {
      gtag('event', 'conversion', {
        send_to: 'AW-18508516374/H_TrCJuanJodEJaYxvlE',
        value: readOrderTotal(orderNumber),
        currency: 'EUR',
        transaction_id: orderNumber ?? '',
      })
    }
  }, [orderNumber])
  return null
}
