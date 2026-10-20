import type { SupabaseClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { ctaButton, emailLayout, escHtml as esc, SITE } from './campaignEmail'
import { normalizeEmail } from './customerSegments'
import { unsubscribeOneClickUrl, unsubscribePageUrl } from './unsubscribe'

export type SavedCartItem = { product_id: string; name: string; slug: string; price: number; image: string; qty: number }

const HOUR = 60 * 60 * 1000
/** Remind carts idle at least this long... */
export const REMIND_AFTER = 1 * HOUR
/** ...but not older than this (stale carts are skipped). */
export const REMIND_WITHIN = 72 * HOUR
/** At most one reminder per email in this window, whatever the cart. */
const EMAIL_COOLDOWN = 7 * 24 * HOUR
const RETENTION = 90 * 24 * HOUR
/** Hard cap on reminders per run, limits damage if capture is abused. */
const MAX_SENDS_PER_RUN = 50

const FROM = 'LED Ivanov Auto <orders@ledivanovauto.com>'

type ClientItem = { product_id?: unknown; qty?: unknown }

/**
 * Rebuild cart items from the database so reminder emails only ever contain our own
 * product names, prices and images — never text supplied by the visitor.
 */
export async function validateCartItems(supabase: SupabaseClient, raw: unknown): Promise<SavedCartItem[]> {
  if (!Array.isArray(raw)) return []
  const items = (raw as ClientItem[])
    .slice(0, 30)
    .filter(i => typeof i?.product_id === 'string' && i.product_id.length <= 500)
    .map(i => ({ product_id: i.product_id as string, qty: Math.min(Math.max(Math.floor(Number(i.qty) || 1), 1), 99) }))
  const baseIds = [...new Set(items.map(i => i.product_id.split('__')[0]))].filter(id => /^[0-9a-f-]{36}$/i.test(id))
  if (!baseIds.length) return []

  const { data } = await supabase
    .from('products')
    .select('id, name, slug, price, sale_price, images, variations')
    .in('id', baseIds)
    .eq('published', true)
  const byId = new Map((data ?? []).map(p => [p.id as string, p]))

  const out: SavedCartItem[] = []
  for (const item of items) {
    const p = byId.get(item.product_id.split('__')[0])
    if (!p) continue
    let price = Number(p.sale_price ?? p.price)
    if (item.product_id.includes('__')) {
      try {
        const attrs = JSON.parse(item.product_id.slice(p.id.length + 2)) as Record<string, string>
        const v = (p.variations as Array<{ attributes: Record<string, string>; price: number; sale_price: number | null }> | null)
          ?.find(x => Object.entries(attrs).every(([k, val]) => x.attributes[k] === val))
        if (v) price = Number(v.sale_price ?? v.price)
      } catch { /* malformed attrs — base price */ }
    }
    out.push({ product_id: item.product_id, name: p.name, slug: p.slug, price, image: (p.images as string[] | null)?.[0] ?? '', qty: item.qty })
  }
  return out
}


export const restoreUrl = (id: string) => `${SITE}/cart/restore/${id}`

function money(n: number) {
  return `${n.toFixed(2)} €`
}

export function renderAbandonedCartHtml(cart: { id: string; items: SavedCartItem[]; total: number }, unsubscribeUrl: string) {
  const rows = cart.items.map(i => {
    const img = /^https:\/\//.test(i.image)
      ? `<img src="${esc(i.image)}" width="64" height="64" alt="" style="display:block;width:64px;height:64px;object-fit:cover;border-radius:8px;border:0;background:#222;">`
      : ''
    return `<tr>
      <td style="padding:8px 12px 8px 0;width:64px;vertical-align:middle;">${img}</td>
      <td style="padding:8px 0;color:#e5e5e5;font-size:14px;line-height:1.4;vertical-align:middle;">${esc(i.name)}<br><span style="color:#9a9a9a;">${i.qty} бр.</span></td>
      <td style="padding:8px 0 8px 12px;color:#ffffff;font-size:14px;font-weight:700;text-align:right;white-space:nowrap;vertical-align:middle;">${money(i.price * i.qty)}</td>
    </tr>`
  }).join('')

  const p = (t: string) => `<p style="margin:0 0 16px;color:#e5e5e5;font-size:15px;line-height:1.6;">${t}</p>`
  const inner = [
    // No client-supplied text in the email (capture endpoint is public)
    p('Здравей!'),
    p('Видяхме, че не завърши поръчката си. Запазихме продуктите в количката ти — можеш да продължиш с един клик.'),
    `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;border-top:1px solid #2a2a2a;border-bottom:1px solid #2a2a2a;">${rows}</table>`,
    `<p style="margin:0 0 20px;color:#ffffff;font-size:15px;font-weight:700;text-align:right;">Общо: ${money(cart.total)}</p>`,
    ctaButton('Завърши поръчката', restoreUrl(cart.id)),
    p('Плащаш с наложен платеж при получаване. Поръчка до 14:00 тръгва същия ден с Еконт или Спиди.'),
    p('Имаш въпрос за съвместимост с колата? Отговори на този имейл или звънни на <a href="tel:+359999997996" style="color:#cc0000;">+359 99 999 7996</a>.'),
  ].join('')

  return emailLayout({
    title: 'Количката те чака',
    preheader: 'Запазихме продуктите ти — завърши поръчката с един клик.',
    inner,
    reason: 'Получаваш този имейл, защото започна поръчка на ledivanovauto.com.',
    unsubscribeUrl,
  })
}

type CartRow = { id: string; email: string; items: SavedCartItem[]; total: number; created_at: string; updated_at: string }

/**
 * Send one reminder per eligible abandoned cart. Uses the service client.
 * Returns counts for the cron / admin trigger.
 */
export async function sendAbandonedCartReminders(service: SupabaseClient, now = Date.now()) {
  // Retention: drop carts older than 90 days (privacy policy)
  await service.from('abandoned_carts').delete().lt('updated_at', new Date(now - RETENTION).toISOString())

  const { data: carts, error } = await service
    .from('abandoned_carts')
    .select('id, email, items, total, created_at, updated_at')
    .is('reminded_at', null)
    .is('recovered_at', null)
    .lte('updated_at', new Date(now - REMIND_AFTER).toISOString())
    .gte('updated_at', new Date(now - REMIND_WITHIN).toISOString())
    .order('updated_at', { ascending: true })
    .limit(200)
  if (error) throw new Error(error.message)

  const resend = new Resend(process.env.RESEND_API_KEY)
  const result = { checked: carts?.length ?? 0, sent: 0, skipped: 0, failed: 0, errors: [] as string[] }
  const handled = new Set<string>()

  for (const cart of (carts ?? []) as CartRow[]) {
    if (result.sent >= MAX_SENDS_PER_RUN) break
    const email = normalizeEmail(cart.email)
    const skip = async () => {
      result.skipped++
      // Mark as handled so it is not re-checked every run
      await service.from('abandoned_carts').update({ reminded_at: new Date(now).toISOString() }).eq('id', cart.id)
    }
    if (!email || handled.has(email) || !cart.items?.length) { await skip(); continue }
    handled.add(email)

    const [{ data: unsub }, { data: orders }, { data: recent }] = await Promise.all([
      service.from('email_unsubscribes').select('email').eq('email', email).limit(1),
      service.from('orders').select('id').ilike('customer_email', email.replace(/[%_\\]/g, '\\$&')).gte('created_at', cart.created_at).limit(1),
      service.from('abandoned_carts').select('id').eq('email', email).gte('reminded_at', new Date(now - EMAIL_COOLDOWN).toISOString()).limit(1),
    ])
    if (orders?.length) {
      result.skipped++
      await service.from('abandoned_carts').update({ recovered_at: new Date(now).toISOString() }).eq('id', cart.id)
      continue
    }
    if (unsub?.length || recent?.length) { await skip(); continue }

    // Claim the cart first so an overlapping run can't send twice
    const { data: claimed } = await service
      .from('abandoned_carts')
      .update({ reminded_at: new Date(now).toISOString() })
      .eq('id', cart.id)
      .is('reminded_at', null)
      .select('id')
    if (!claimed?.length) continue

    const unsub_url = unsubscribePageUrl(email)
    const { error: sendError } = await resend.emails.send({
      from: FROM,
      to: [email],
      replyTo: process.env.ADMIN_EMAIL,
      subject: 'Количката ти те чака',
      html: renderAbandonedCartHtml(cart, unsub_url),
      headers: {
        'List-Unsubscribe': `<${unsubscribeOneClickUrl(email)}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    }, { idempotencyKey: `abandoned-cart-${cart.id}` })

    if (sendError) {
      result.failed++
      result.errors.push(sendError.message)
      await service.from('abandoned_carts').update({ reminded_at: null }).eq('id', cart.id)
    } else {
      result.sent++
    }
  }
  return result
}
