import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { emailRecipients, loadCustomers, loadUnsubscribed, segmentContext, SEGMENTS } from '@/lib/customerSegments'
import { findPlaceholder, personalize, renderCampaignHtml, renderCampaignText, type CampaignContent } from '@/lib/campaignEmail'
import { unsubscribeOneClickUrl, unsubscribePageUrl } from '@/lib/unsubscribe'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const FROM = 'LED Ivanov Auto <news@ledivanovauto.com>'
const BATCH = 100

type Body = CampaignContent & { mode: 'test' | 'send'; segment: string; template?: string }

function message(to: string, firstName: string, c: CampaignContent) {
  const unsub = unsubscribePageUrl(to)
  return {
    from: FROM,
    to: [to],
    replyTo: process.env.ADMIN_EMAIL,
    subject: personalize(c.subject, firstName),
    html: renderCampaignHtml(c, firstName, unsub),
    text: renderCampaignText(c, firstName, unsub),
    headers: {
      'List-Unsubscribe': `<${unsubscribeOneClickUrl(to)}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const b = (await req.json()) as Partial<Body>
  const c: CampaignContent = {
    subject: String(b.subject ?? '').trim(),
    preheader: String(b.preheader ?? '').trim(),
    body: String(b.body ?? ''),
    ctaLabel: String(b.ctaLabel ?? '').trim(),
    ctaUrl: String(b.ctaUrl ?? '').trim(),
  }
  if (!c.subject || c.subject.length > 150) return NextResponse.json({ error: 'Темата е празна или твърде дълга' }, { status: 400 })
  if (!c.body.trim() || c.body.length > 10_000) return NextResponse.json({ error: 'Текстът е празен или твърде дълъг' }, { status: 400 })
  const placeholder = findPlaceholder(c)
  if (placeholder) return NextResponse.json({ error: `Попълни ${placeholder} преди пращане` }, { status: 400 })
  if (c.ctaUrl && !/^https:\/\/\S+$/.test(c.ctaUrl)) {
    return NextResponse.json({ error: 'Линкът на бутона трябва да започва с https://' }, { status: 400 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  if (b.mode === 'test') {
    if (!user.email) return NextResponse.json({ error: 'Акаунтът няма имейл' }, { status: 400 })
    const { error } = await resend.emails.send(message(user.email, 'Иван', c))
    if (error) return NextResponse.json({ error: error.message }, { status: 502 })
    return NextResponse.json({ ok: true, sent: 1, to: user.email })
  }

  const segment = SEGMENTS.find(s => s.key === b.segment)
  if (!segment) return NextResponse.json({ error: 'Невалиден сегмент' }, { status: 400 })

  const unsubscribed = await loadUnsubscribed(supabase)
  if (!unsubscribed) return NextResponse.json({ error: 'Липсва таблица email_unsubscribes — пусни миграция 018' }, { status: 500 })

  // Block accidental double sends of the same campaign to the same segment
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data: recent } = await supabase
    .from('email_campaigns').select('id').eq('subject', c.subject).eq('segment', segment.key).gte('created_at', since).limit(1)
  if (recent?.length) return NextResponse.json({ error: 'Тази кампания вече е пратена на този сегмент през последните 24 часа' }, { status: 409 })

  const customers = await loadCustomers(supabase)
  const recipients = emailRecipients(customers, segment, segmentContext(customers), unsubscribed)
  if (!recipients.length) return NextResponse.json({ error: 'Няма получатели с имейл в този сегмент' }, { status: 400 })

  const { data: campaign, error: insertError } = await supabase
    .from('email_campaigns')
    .insert({ subject: c.subject, segment: segment.key, template: b.template ?? null, recipients: recipients.length })
    .select('id')
    .single()
  if (insertError || !campaign) return NextResponse.json({ error: insertError?.message ?? 'Грешка при запис' }, { status: 500 })

  let sent = 0
  let failed = 0
  let lastError: string | null = null
  for (let i = 0; i < recipients.length; i += BATCH) {
    const chunk = recipients.slice(i, i + BATCH).map(r => message(r.email!, r.firstName, c))
    const { error } = await resend.batch.send(chunk, { idempotencyKey: `campaign-${campaign.id}-${i}` })
    if (error) {
      failed += chunk.length
      lastError = error.message
    } else {
      sent += chunk.length
    }
  }

  await createServiceClient()
    .from('email_campaigns')
    .update({ sent, failed, status: failed ? (sent ? 'partial' : 'failed') : 'sent', error: lastError })
    .eq('id', campaign.id)

  return NextResponse.json({ ok: failed === 0, sent, failed, error: lastError }, { status: sent ? 200 : 502 })
}
