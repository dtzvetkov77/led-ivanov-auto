import { createClient } from '@/lib/supabase/server'
import { emailRecipients, loadCustomers, loadUnsubscribed, segmentContext, SEGMENTS } from '@/lib/customerSegments'
import CampaignComposer from '@/components/CampaignComposer'
import AbandonedCartsButton from '@/components/AbandonedCartsButton'

export const dynamic = 'force-dynamic'

const SEGMENT_LABEL = Object.fromEntries(SEGMENTS.map(s => [s.key, s.label]))
const STATUS: Record<string, string> = { sending: 'Праща се', sent: 'Пратена', partial: 'Частично', failed: 'Неуспешна' }

type CartRow = { id: string; email: string; total: number; updated_at: string; reminded_at: string | null; recovered_at: string | null }

function cartStatus(c: CartRow) {
  if (c.recovered_at) return { label: 'Поръчано', cls: 'text-green-400' }
  if (c.reminded_at) return { label: 'Напомнено', cls: 'text-accent' }
  return { label: 'Чака', cls: 'text-muted' }
}

type CampaignRow = { id: string; subject: string; segment: string; recipients: number; sent: number; failed: number; status: string; error: string | null; created_at: string }

export default async function AdminCampaignsPage() {
  const supabase = await createClient()
  const [customers, unsubscribed, history, carts] = await Promise.all([
    loadCustomers(supabase),
    loadUnsubscribed(supabase),
    supabase.from('email_campaigns').select('*').order('created_at', { ascending: false }).limit(30),
    supabase.from('abandoned_carts').select('id, email, total, updated_at, reminded_at, recovered_at').order('updated_at', { ascending: false }).limit(30),
  ])
  const cartRows = (carts.data ?? []) as CartRow[]
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
        <div className="p-4 border-b border-border space-y-3">
          <div>
            <h2 className="font-semibold">Изоставени колички</h2>
            <p className="text-xs text-muted mt-1">
              Когато клиент въведе имейл в checkout и не поръча, получава едно напомняне с линк към количката (1 ч. до 3 дни след това).
              Автоматично всеки ден в 11:00. Най-много едно напомняне на имейл за 7 дни.
            </p>
          </div>
          {carts.error ? (
            <div className="border border-yellow-400/30 bg-yellow-400/10 text-yellow-300 rounded-xl p-3 text-sm">
              Липсва таблицата. Пусни <code>supabase/migrations/019_abandoned_carts.sql</code> в Supabase SQL Editor.
            </div>
          ) : (
            <AbandonedCartsButton disabled={false} />
          )}
        </div>
        {!carts.error && (cartRows.length === 0 ? (
          <p className="p-4 text-sm text-muted">Още няма изоставени колички.</p>
        ) : (
          <div className="divide-y divide-border">
            {cartRows.map(c => {
              const st = cartStatus(c)
              return (
                <div key={c.id} className="p-4 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate">{c.email}</p>
                    <p className="text-xs text-muted">{new Date(c.updated_at).toLocaleString('bg-BG', { timeZone: 'Europe/Sofia' })}</p>
                  </div>
                  <span className="tabular-nums">
                    <span className="text-muted">{Number(c.total).toFixed(2)} € · </span>
                    <span className={st.cls}>{st.label}</span>
                  </span>
                </div>
              )
            })}
          </div>
        ))}
      </div>

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
