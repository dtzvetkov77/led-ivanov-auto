'use client'
import { useEffect } from 'react'
import { CONVERSIONS, setUserData, trackConversion } from '@/lib/gtag'

type Props = { orderNumber: string | null }
type LastOrder = { order_number: string; total: number; email?: string; phone?: string }

// Order stored by CheckoutForm in sessionStorage, only if it belongs to this order
function readLastOrder(orderNumber: string | null): LastOrder | null {
  if (!orderNumber) return null
  try {
    const last = JSON.parse(sessionStorage.getItem('last_order') ?? 'null')
    if (last?.order_number === orderNumber) return last
  } catch {}
  return null
}

export default function ConversionTracker({ orderNumber }: Props) {
  useEffect(() => {
    // Only a real order placed in this browser session counts: a bare visit,
    // a shared link or a reload on another device sends nothing
    const order = readLastOrder(orderNumber)
    if (!order) return
    const sentKey = `conv_sent_${order.order_number}`
    try { if (sessionStorage.getItem(sentKey)) return } catch {}

    setUserData(order.email, order.phone)
    trackConversion(CONVERSIONS.purchase, {
      value: Number(order.total) || 0,
      currency: 'EUR',
      transaction_id: order.order_number,
    })
    try { sessionStorage.setItem(sentKey, '1') } catch {}
  }, [orderNumber])
  return null
}
