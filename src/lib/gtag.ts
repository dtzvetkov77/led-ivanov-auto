// Google Ads conversion tracking (AW-18508516374). One place for every send_to label.
export const ADS_ID = 'AW-18508516374'

export const CONVERSIONS = {
  purchase: `${ADS_ID}/H_TrCJuanJodEJaYxvlE`,
  // Add to cart and begin checkout back on 2026-10-19 (observe only, not bid on),
  // to see where ad visitors drop off. Phone click stays off: an empty label is a
  // no-op; to turn it back on use 3YqvCIzGtJsdEJaYxvlE
  phoneClick: '',
  addToCart: `${ADS_ID}/uZ1fCJLGtJsdEJaYxvlE`,
  beginCheckout: `${ADS_ID}/6xy4CJXGtJsdEJaYxvlE`,
} as const

type Gtag = (...args: unknown[]) => void

function getGtag(): Gtag | null {
  if (typeof window === 'undefined') return null
  const g = (window as unknown as { gtag?: Gtag }).gtag
  return typeof g === 'function' ? g : null
}

export function trackConversion(sendTo: string, params: Record<string, unknown> = {}): void {
  const gtag = getGtag()
  if (!gtag || !sendTo) return
  gtag('event', 'conversion', { send_to: sendTo, ...params })
}

// GA4 (G-09HDCZYTM9) is a destination of the same Google tag, so page views
// arrive on their own; e-commerce events are sent explicitly here.
export const GA4_ID = 'G-09HDCZYTM9'

export type Ga4Item = { product_id: string; name: string; price: number; qty: number }

export function trackGa4(
  event: 'add_to_cart' | 'begin_checkout' | 'purchase',
  items: Ga4Item[],
  extra: Record<string, unknown> = {},
): void {
  const gtag = getGtag()
  if (!gtag || !items.length) return
  gtag('event', event, {
    send_to: GA4_ID,
    currency: 'EUR',
    value: Math.round(items.reduce((s, i) => s + i.price * i.qty, 0) * 100) / 100,
    items: items.map(i => ({ item_id: i.product_id, item_name: i.name, price: i.price, quantity: i.qty })),
    ...extra,
  })
}

// Enhanced conversions: gtag hashes these (SHA-256) before sending
export function setUserData(email?: string | null, phone?: string | null): void {
  const gtag = getGtag()
  if (!gtag) return
  const data: Record<string, string> = {}
  const e = email?.trim().toLowerCase()
  if (e) data.email = e
  const p = toE164(phone)
  if (p) data.phone_number = p
  if (Object.keys(data).length) gtag('set', 'user_data', data)
}

// Bulgarian numbers: 0888123456 / 359888123456 / +359 888 123 456 -> +359888123456
function toE164(phone?: string | null): string | null {
  if (!phone) return null
  const digits = phone.replace(/[^\d+]/g, '')
  if (digits.startsWith('+')) return digits.length > 8 ? digits : null
  if (digits.startsWith('00')) return `+${digits.slice(2)}`
  if (digits.startsWith('359')) return `+${digits}`
  if (digits.startsWith('0')) return `+359${digits.slice(1)}`
  return null
}
