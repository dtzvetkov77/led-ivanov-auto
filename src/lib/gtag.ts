// Google Ads conversion tracking (AW-18508516374). One place for every send_to label.
export const ADS_ID = 'AW-18508516374'

export const CONVERSIONS = {
  purchase: `${ADS_ID}/H_TrCJuanJodEJaYxvlE`,
  phoneClick: '',
  addToCart: '',
  beginCheckout: '',
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
