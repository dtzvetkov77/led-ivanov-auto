// Where a buyer came from (Google Ads, Facebook, Google search, direct...).
// Captured client-side on landing, sent with the order and stored in
// orders.source so each order shows its traffic source in the admin.
// Two touches are kept: the latest non-direct visit (what brought them back
// to buy) and the very first visit (what found them in the first place).

export type Touch = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  gclid?: string
  fbclid?: string
  srsltid?: string
  gad_source?: string
  gad_campaignid?: string
  referrer?: string
  landing_page?: string
  captured_at?: string
}

export type TrafficSource = Touch & {
  first?: Touch
  visits?: number
}

const LAST_KEY = 'traffic_source'
const FIRST_KEY = 'traffic_source_first'
const VISITS_KEY = 'traffic_visits'
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000
const FIRST_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000
const PARAMS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'gclid', 'fbclid', 'srsltid', 'gad_source', 'gad_campaignid',
] as const

// Google Ads IDs -> names (utm_campaign={campaignid}, utm_content={adgroupid} via the account's final URL suffix)
const ADS_CAMPAIGNS: Record<string, string> = {
  '24340777425': 'LED крушки',
}
const ADS_AD_GROUPS: Record<string, string> = {
  '202522196153': 'H7 LED',
  '202522196313': 'LED крушки за кола',
  '202522196353': 'H4 LED',
}

function readTouch(key: string, maxAge: number): Touch | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const s = JSON.parse(raw) as Touch
    if (s.captured_at && Date.now() - new Date(s.captured_at).getTime() > maxAge) return null
    return s
  } catch {
    return null
  }
}

// Call once per page load (first render).
export function captureTrafficSource() {
  try {
    const url = new URL(window.location.href)
    const found: Touch = {}
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

    // One visit per browser session (reloads and new tabs in the same session don't count)
    if (!sessionStorage.getItem(VISITS_KEY)) {
      sessionStorage.setItem(VISITS_KEY, '1')
      const n = Number(localStorage.getItem(VISITS_KEY) ?? '0') || 0
      localStorage.setItem(VISITS_KEY, String(n + 1))
    }

    const now = new Date().toISOString()
    const landing_page = (url.pathname + url.search).slice(0, 300)
    const isTagged = Object.keys(found).length > 0 || !!externalReferrer

    if (!readTouch(FIRST_KEY, FIRST_MAX_AGE_MS)) {
      // First visit ever (or older than 90 days): record it, direct or not
      localStorage.setItem(FIRST_KEY, JSON.stringify({ ...found, referrer: externalReferrer, landing_page, captured_at: now }))
    }

    if (!isTagged) {
      // Direct visit: keep a previous source unless it expired
      if (!readTouch(LAST_KEY, MAX_AGE_MS) && localStorage.getItem(LAST_KEY)) localStorage.removeItem(LAST_KEY)
      return
    }
    localStorage.setItem(LAST_KEY, JSON.stringify({ ...found, referrer: externalReferrer, landing_page, captured_at: now }))
  } catch {}
}

export function readTrafficSource(): TrafficSource | null {
  try {
    const last = readTouch(LAST_KEY, MAX_AGE_MS)
    const first = readTouch(FIRST_KEY, FIRST_MAX_AGE_MS)
    const visits = Number(localStorage.getItem(VISITS_KEY) ?? '0') || undefined
    if (!last && !first) return null
    return { ...(last ?? {}), first: first ?? undefined, visits }
  } catch {
    return null
  }
}

const PAID_MEDIUMS = ['cpc', 'ppc', 'paid', 'paidsocial', 'paid_social', 'ads', 'ad', 'cpm', 'display']

const AI_HOSTS: [RegExp, string][] = [
  [/(^|\.)(chatgpt\.com|openai\.com)$/, 'ChatGPT'],
  [/(^|\.)perplexity\.ai$/, 'Perplexity'],
  [/(^|\.)gemini\.google\.com$/, 'Gemini'],
  [/(^|\.)copilot\.microsoft\.com$/, 'Copilot'],
  [/(^|\.)claude\.ai$/, 'Claude'],
]

const REFERRER_HOSTS: [RegExp, string][] = [
  [/(^|\.)(facebook\.com|fb\.com)$/, 'Facebook'],
  [/(^|\.)instagram\.com$/, 'Instagram'],
  [/(^|\.)bing\.com$/, 'Bing търсене'],
  [/(^|\.)duckduckgo\.com$/, 'DuckDuckGo търсене'],
  [/(^|\.)yandex\./, 'Yandex търсене'],
  [/(^|\.)tiktok\.com$/, 'TikTok'],
  [/(^|\.)(youtube\.com|youtu\.be)$/, 'YouTube'],
  [/(^|\.)viber\.com$/, 'Viber'],
  [/(^|\.)(whatsapp\.com|wa\.me)$/, 'WhatsApp'],
  [/(^|\.)(mail\.google\.com|abv\.bg|mail\.bg|outlook\.live\.com)$/, 'Имейл'],
]

function hostOf(url?: string) {
  if (!url) return ''
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return '' }
}

export type SourceInfo = {
  label: string            // channel, e.g. "Google реклама"
  paid: boolean
  campaign: string | null  // campaign name or utm_campaign
  adGroup: string | null
  keyword: string | null
  detail: string | null    // one-line summary of campaign / ad group / keyword
}

// Human-readable source of one touch, e.g. "Google реклама", "Facebook", "Директно".
export function describeSource(s: Touch | null | undefined): SourceInfo {
  const out = (label: string, paid = false, campaign: string | null = null, adGroup: string | null = null, keyword: string | null = null): SourceInfo => ({
    label, paid, campaign, adGroup, keyword,
    detail: [campaign, adGroup, keyword && `"${keyword}"`].filter(Boolean).join(' · ') || null,
  })
  if (!s) return out('Директно')
  const src = (s.utm_source ?? '').toLowerCase()
  const medium = (s.utm_medium ?? '').toLowerCase()
  const paid = PAID_MEDIUMS.includes(medium)
  const host = hostOf(s.referrer)
  const campaign = s.utm_campaign ?? null

  if (s.gclid || s.gad_source || (src.includes('google') && paid)) {
    const campaignId = s.gad_campaignid ?? s.utm_campaign
    const name = (campaignId && ADS_CAMPAIGNS[campaignId]) ?? campaignId ?? null
    const adGroup = s.utm_content ? (ADS_AD_GROUPS[s.utm_content] ?? s.utm_content) : null
    return out('Google реклама', true, name, adGroup, s.utm_term ?? null)
  }
  if (['facebook', 'fb', 'instagram', 'ig', 'meta', 'facebook.com', 'instagram.com', 'l.facebook.com', 'm.facebook.com'].includes(src)) {
    const name = src.startsWith('ig') || src.startsWith('instagram') ? 'Instagram' : 'Facebook'
    return out(paid ? `${name} реклама` : name, paid, campaign)
  }
  if (s.fbclid) {
    // fbclid is added to every Facebook/Instagram click, ad or post alike
    const name = host.includes('instagram') ? 'Instagram' : 'Facebook'
    return out(`${name} (реклама или пост)`, false, campaign)
  }
  const ai = AI_HOSTS.find(([re]) => re.test(src) || re.test(host))
  if (ai) return out(`${ai[1]} (AI)`)
  if (medium === 'email' || src === 'email' || src === 'newsletter') return out('Имейл', false, campaign)
  if (src) return out(paid ? `${s.utm_source} реклама` : s.utm_source!, paid, campaign, null, s.utm_term ?? null)
  // srsltid is added by Google to free product listings and organic results of Merchant Center shops
  if (s.srsltid) return out(/(^|\.)google\./.test(host) || !host ? 'Google търсене / Shopping (безплатно)' : host)
  if (/(^|\.)google\./.test(host)) return out('Google търсене')
  const known = REFERRER_HOSTS.find(([re]) => re.test(host))
  if (known) return out(known[1])
  if (host) return out(host)
  return out('Директно')
}
