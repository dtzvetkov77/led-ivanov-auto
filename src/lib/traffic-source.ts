// Where a buyer came from (Google Ads, Facebook, Google search, direct...).
// Captured client-side on landing, sent with the order and stored in
// orders.source so each order shows its traffic source in the admin.

export type TrafficSource = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  gclid?: string
  fbclid?: string
  referrer?: string
  landing_page?: string
  captured_at?: string
}

const STORAGE_KEY = 'traffic_source'
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000
const PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'] as const

// Call on page load. Keeps the last non-direct visit (ad click, external link)
// for 30 days; plain direct/internal navigation doesn't overwrite it.
export function captureTrafficSource() {
  try {
    const url = new URL(window.location.href)
    const found: TrafficSource = {}
    for (const p of PARAMS) {
      const v = url.searchParams.get(p)
      if (v) found[p] = v.slice(0, 300)
    }
    // Google Ads iOS/app variants of gclid
    const braid = url.searchParams.get('gbraid') ?? url.searchParams.get('wbraid')
    if (braid && !found.gclid) found.gclid = braid.slice(0, 300)

    let externalReferrer: string | undefined
    if (document.referrer) {
      const ref = new URL(document.referrer)
      if (ref.hostname !== window.location.hostname) externalReferrer = document.referrer.slice(0, 300)
    }

    if (Object.keys(found).length === 0 && !externalReferrer) {
      // Direct visit: keep a previous source unless it expired
      const existing = readTrafficSource()
      if (existing) return
      if (localStorage.getItem(STORAGE_KEY)) localStorage.removeItem(STORAGE_KEY)
      return
    }

    const source: TrafficSource = {
      ...found,
      referrer: externalReferrer,
      landing_page: (url.pathname + url.search).slice(0, 300),
      captured_at: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(source))
  } catch {}
}

export function readTrafficSource(): TrafficSource | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as TrafficSource
    if (s.captured_at && Date.now() - new Date(s.captured_at).getTime() > MAX_AGE_MS) return null
    return s
  } catch {
    return null
  }
}

const PAID_MEDIUMS = ['cpc', 'ppc', 'paid', 'paidsocial', 'paid_social', 'ads', 'ad', 'cpm', 'display']

function hostOf(url?: string) {
  if (!url) return ''
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return '' }
}

// Human-readable label for the admin, e.g. "Google реклама", "Facebook", "Директно".
export function describeSource(s: TrafficSource | null | undefined): { label: string; detail: string | null } {
  if (!s) return { label: 'Директно', detail: null }
  const src = (s.utm_source ?? '').toLowerCase()
  const medium = (s.utm_medium ?? '').toLowerCase()
  const paid = PAID_MEDIUMS.includes(medium)
  const host = hostOf(s.referrer)
  const campaign = s.utm_campaign ?? null

  if (s.gclid || (src.includes('google') && paid)) return { label: 'Google реклама', detail: campaign }
  if (['facebook', 'fb', 'instagram', 'ig', 'meta', 'facebook.com', 'instagram.com'].includes(src)) {
    const name = src.startsWith('ig') || src.startsWith('instagram') ? 'Instagram' : 'Facebook'
    return { label: paid ? `${name} реклама` : name, detail: campaign }
  }
  if (s.fbclid) {
    // fbclid is added to every Facebook/Instagram click, ad or post alike
    const name = host.includes('instagram') ? 'Instagram' : 'Facebook'
    return { label: `${name} (реклама или пост)`, detail: campaign }
  }
  if (src) return { label: paid ? `${s.utm_source} реклама` : s.utm_source!, detail: campaign }
  if (/(^|\.)google\./.test(host)) return { label: 'Google търсене', detail: null }
  if (/(^|\.)(facebook\.com|fb\.com)$/.test(host)) return { label: 'Facebook', detail: null }
  if (/(^|\.)instagram\.com$/.test(host)) return { label: 'Instagram', detail: null }
  if (/(^|\.)bing\.com$/.test(host)) return { label: 'Bing търсене', detail: null }
  if (/(^|\.)tiktok\.com$/.test(host)) return { label: 'TikTok', detail: null }
  if (/(^|\.)(youtube\.com|youtu\.be)$/.test(host)) return { label: 'YouTube', detail: null }
  if (host) return { label: host, detail: null }
  return { label: 'Директно', detail: null }
}
