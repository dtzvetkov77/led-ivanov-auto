import { createClient } from '@/lib/supabase/server'
import { emailRecipients, loadCustomers, loadUnsubscribed, segmentContext, SEGMENTS } from '@/lib/customerSegments'
import CampaignComposer from '@/components/CampaignComposer'

export const dynamic = 'force-dynamic'

const SEGMENT_LABEL = Object.fromEntries(SEGMENTS.map(s => [s.key, s.label]))
const STATUS: Record<string, string> = { sending: 'Праща се', sent: 'Пратена', partial: 'Частично', failed: 'Неуспешна' }

type CampaignRow = { id: string; subject: string; segment: string; recipients: number; sent: number; failed: number; status: string; error: string | null; created_at: string }

export default async function AdminCampaignsPage() {
  const supabase = await createClient()
  const [customers, unsubscribed, history] = await Promise.all([
    loadCustomers(supabase),
    loadUnsubscribed(supabase),
    supabase.from('email_campaigns').select('*').order('created_at', { ascending: false }).limit(30),
  ])
  const ctx = segmentContext(customers)
  const segments = SEGMENTS.map(s => ({
    key: s.key,
    label: s.label,
    count: emailRecipients(customers, s, ctx, unsubscribed ?? new Set()).length,
  }))
  const campaigns = (history.data ?? []) as CampaignRow[]

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold">Имейл кампании</h1>
        <p className="text-sm text-muted mt-1">
          Пращане до купувачи с имейл по сегменти. Всеки имейл има линк за отписване — отписаните не получават повече.
          {unsubscribed && ` Отписани: ${unsubscribed.size}.`}
        </p>
      </div>

      {!unsubscribed && (
        <div className="border border-yellow-400/30 bg-yellow-400/10 text-yellow-300 rounded-2xl p-4 text-sm">
          Липсват таблиците за кампании. Пусни <code>supabase/migrations/018_email_campaigns.sql</code> в Supabase SQL Editor.
          Дотогава работи само тестовото пращане.
        </div>
      )}

      <CampaignComposer segments={segments} canSend={!!unsubscribed} />

      <div className="bg-surface border border-border rounded-2xl">
        <h2 className="font-semibold p-4 border-b border-border">История</h2>
        {campaigns.length === 0 ? (
          <p className="p-4 text-sm text-muted">Още няма пратени кампании.</p>
        ) : (
          <div className="divide-y divide-border">
            {campaigns.map(c => (
              <div key={c.id} className="p-4 flex flex-wrap items-center justify-between gap-2 text-sm">
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">{c.subject}</p>
                  <p className="text-xs text-muted">
                    {new Date(c.created_at).toLocaleString('bg-BG', { timeZone: 'Europe/Sofia' })} · {SEGMENT_LABEL[c.segment] ?? c.segment}
                    {c.error && <span className="text-red-400"> · {c.error}</span>}
                  </p>
                </div>
                <span className="text-muted tabular-nums">
                  {STATUS[c.status] ?? c.status} · {c.sent}/{c.recipients}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
