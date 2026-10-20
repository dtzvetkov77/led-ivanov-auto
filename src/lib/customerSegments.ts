import type { SupabaseClient } from '@supabase/supabase-js'
import type { CartItem, OrderStatus } from './types'

type OrderRow = {
  customer_name: string | null
  customer_phone: string | null
  customer_email: string | null
  items: CartItem[] | null
  total: number | string | null
  status: OrderStatus
  created_at: string
}

export type Customer = {
  phone: string | null
  email: string | null
  firstName: string
  lastName: string
  orders: number
  delivered: number
  spend: number
  lastOrder: number
  itemText: string[]
  categories: Set<string>
}

const DAY = 24 * 60 * 60 * 1000

/** Normalize a Bulgarian phone number to E.164 (+359XXXXXXXXX), or null if it can't be. */
export function normalizePhone(raw: string | null): string | null {
  if (!raw) return null
  const plus = raw.trim().startsWith('+')
  let d = raw.replace(/\D/g, '')
  if (d.startsWith('00')) d = d.slice(2)
  else if (plus) return d.length >= 8 && d.length <= 15 ? `+${d}` : null
  if (d.startsWith('359') && d.length === 12) return `+${d}`
  if (d.startsWith('0') && d.length === 10) return `+359${d.slice(1)}`
  if (d.length === 9 && /^[89]/.test(d)) return `+359${d}`
  return null
}

export function normalizeEmail(raw: string | null): string | null {
  const e = raw?.trim().toLowerCase()
  return e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : null
}

// Cyrillic look-alikes customers and product names use for socket codes (Н7, Т10)
const LOOKALIKE: Record<string, string> = { 'Н': 'H', 'н': 'h', 'Т': 'T', 'т': 't', 'Д': 'D', 'д': 'd', 'С': 'S', 'с': 's' }
const latinize = (s: string) => s.replace(/[НнТтДдСс]/g, c => LOOKALIKE[c])
const code = (pattern: string) => new RegExp(`(^|[^a-z0-9])(${pattern})($|[^a-z0-9])`, 'i')

export type Segment = {
  key: string
  label: string
  description: string
  match: (c: Customer, ctx: { now: number; topSpend: number }) => boolean
}

const byProduct = (key: string, label: string, test: (text: string, c: Customer) => boolean): Segment => ({
  key,
  label,
  description: `Купували ${label}`,
  match: c => c.itemText.some(t => test(t, c) || test(latinize(t), c)),
})

export const SEGMENTS: Segment[] = [
  { key: 'all', label: 'Всички купувачи', description: 'Всеки с поне една неотказана поръчка', match: () => true },
  { key: 'delivered', label: 'Доставени поръчки', description: 'Поне една поръчка със статус Доставена', match: c => c.delivered > 0 },
  { key: 'repeat', label: 'Повторни клиенти', description: '2 или повече поръчки', match: c => c.orders >= 2 },
  { key: 'top-spend', label: 'Топ 20% по оборот', description: 'Най-много похарчили клиенти', match: (c, x) => c.spend >= x.topSpend },
  { key: 'recent-90', label: 'Последни 90 дни', description: 'Последна поръчка до 90 дни назад', match: (c, x) => x.now - c.lastOrder <= 90 * DAY },
  { key: 'lapsed-180', label: 'Неактивни 180+ дни', description: 'Последна поръчка преди повече от 180 дни', match: (c, x) => x.now - c.lastOrder > 180 * DAY },
  byProduct('h7', 'H7', t => code('h7').test(t)),
  byProduct('h4', 'H4', t => code('h4').test(t)),
  byProduct('h1-h11', 'H1 / H11 / H8 / H16', t => code('h1|h11|h8|h16').test(t)),
  byProduct('hb', 'HB3 / HB4 / 9005 / 9006', t => code('hb3|hb4|9005|9006|hir2|9012').test(t)),
  byProduct('xenon', 'LED заместител на ксенон (D1S–D8S)', t => code('d[1-8][sr]').test(t) || /ксенон|xenon/i.test(t)),
  byProduct('small', 'габаритни / малки крушки (T10, W5W, T15, T20, 1156, 1157)', t => code('t10|w5w|t15|w16w|t20|w21w|7440|7443|1156|1157|p21w|py21w|c5w|festoon|софит').test(t)),
  byProduct('canbus', 'CANBUS модули и декодери', t => /canbus|канбус|декодер|модул/i.test(t)),
  {
    key: 'drl',
    label: 'Дневни светлини',
    description: 'Купували дневни LED светлини',
    match: c => c.categories.has('dnevni-svetlini') || c.itemText.some(t => /дневн/i.test(t)),
  },
  {
    key: 'plate',
    label: 'LED плафони за номер',
    description: 'Купували плафони за номер',
    match: c => c.categories.has('led-plafoni-za-nomer') || c.itemText.some(t => /плафон/i.test(t)),
  },
  {
    key: 'dynamic',
    label: 'Бягащи мигачи',
    description: 'Купували dynamic / бягащи мигачи',
    match: c => c.categories.has('byagashti-migachi') || c.itemText.some(t => /бягащ|dynamic/i.test(t)),
  },
]

async function fetchOrders(supabase: SupabaseClient): Promise<OrderRow[]> {
  const rows: OrderRow[] = []
  const page = 1000
  for (let from = 0; ; from += page) {
    const { data, error } = await supabase
      .from('orders')
      .select('customer_name, customer_phone, customer_email, items, total, status, created_at')
      .neq('status', 'cancelled')
      .order('created_at', { ascending: true })
      .range(from, from + page - 1)
    if (error) throw new Error(error.message)
    rows.push(...((data ?? []) as OrderRow[]))
    if (!data || data.length < page) return rows
  }
}

/** Group non-cancelled orders into one record per customer (keyed by phone, else email). */
export async function loadCustomers(supabase: SupabaseClient): Promise<Customer[]> {
  const orders = await fetchOrders(supabase)
  const byKey = new Map<string, Customer>()
  const emailToKey = new Map<string, string>()

  for (const o of orders) {
    const phone = normalizePhone(o.customer_phone)
    const email = normalizeEmail(o.customer_email)
    const key = phone ?? (email && emailToKey.get(email)) ?? email
    if (!key) continue

    let c = byKey.get(key)
    if (!c) {
      const [first = '', ...rest] = (o.customer_name ?? '').trim().split(/\s+/)
      c = {
        phone, email, firstName: first, lastName: rest.join(' '),
        orders: 0, delivered: 0, spend: 0, lastOrder: 0, itemText: [], categories: new Set(),
      }
      byKey.set(key, c)
    }
    if (!c.email && email) c.email = email
    if (email) emailToKey.set(email, key)

    c.orders++
    if (o.status === 'delivered') c.delivered++
    c.spend += Number(o.total) || 0
    c.lastOrder = Math.max(c.lastOrder, new Date(o.created_at).getTime())
    for (const it of o.items ?? []) {
      if (it.name) c.itemText.push(it.name)
      if (it.category_slug) c.categories.add(it.category_slug)
    }
  }
  return [...byKey.values()]
}

export function segmentContext(customers: Customer[], now = Date.now()) {
  const spends = customers.map(c => c.spend).sort((a, b) => b - a)
  const topSpend = spends.length ? spends[Math.max(0, Math.ceil(spends.length * 0.2) - 1)] : Infinity
  return { now, topSpend }
}

const csvCell = (v: string) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)

/** Google Ads Customer Match CSV (unhashed — Google hashes on upload). */
export function toCustomerMatchCsv(customers: Customer[]): string {
  const lines = ['Email,Phone,First Name,Last Name,Country,Zip']
  for (const c of customers) {
    lines.push([c.email ?? '', c.phone ?? '', c.firstName, c.lastName, 'BG', ''].map(csvCell).join(','))
  }
  return lines.join('\n') + '\n'
}
