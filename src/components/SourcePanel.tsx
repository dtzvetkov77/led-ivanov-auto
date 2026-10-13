import type { Order } from '@/lib/types'
import { describeSource, type Touch } from '@/lib/traffic-source'

function fmtDate(iso?: string) {
  if (!iso) return null
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d.toLocaleString('bg-BG', { timeZone: 'Europe/Sofia', dateStyle: 'short', timeStyle: 'short' })
}

function daysBetween(from?: string, to?: string) {
  if (!from || !to) return null
  const ms = new Date(to).getTime() - new Date(from).getTime()
  if (Number.isNaN(ms) || ms < 0) return null
  const days = Math.floor(ms / 86400000)
  if (days === 0) {
    const hours = Math.floor(ms / 3600000)
    return hours === 0 ? 'под 1 час' : `${hours} ч.`
  }
  return days === 1 ? '1 ден' : `${days} дни`
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  if (v === null || v === undefined || v === '') return null
  return (
    <div className="flex gap-3">
      <span className="text-muted w-36 shrink-0">{k}</span>
      <span className="break-all">{v}</span>
    </div>
  )
}

function TouchBlock({ title, t }: { title: string; t: Touch }) {
  const s = describeSource(t)
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-bold uppercase tracking-wider text-muted">{title}</p>
      <Row k="Канал" v={<span className="font-semibold">{s.label}{s.paid ? ' (платено)' : ''}</span>} />
      <Row k="Кампания" v={s.campaign} />
      <Row k="Рекламна група" v={s.adGroup} />
      <Row k="Ключова дума" v={s.keyword} />
      <Row k="Входна страница" v={t.landing_page} />
      <Row k="Дошъл от" v={t.referrer} />
      <Row k="Кога" v={fmtDate(t.captured_at)} />
      <Row k="Google click ID" v={t.gclid ? <span className="font-mono text-xs">{t.gclid.slice(0, 24)}...</span> : null} />
    </div>
  )
}

export default function SourcePanel({ order }: { order: Order }) {
  const src = order.source
  if (!src) {
    return (
      <div className="bg-surface border border-border rounded-lg p-4 mb-6 text-sm">
        <h2 className="font-semibold mb-2">Източник на поръчката</h2>
        <p className="text-muted">Директно или неизвестно (няма данни за реклама, линк или търсачка).</p>
      </div>
    )
  }
  const { first, visits, ...last } = src
  const hasLast = Object.values(last).some(Boolean)
  const sameTouch = first && hasLast && first.captured_at === last.captured_at
  const firstSeen = first?.captured_at ?? last.captured_at
  return (
    <div className="bg-surface border border-border rounded-lg p-4 mb-6 text-sm space-y-4">
      <h2 className="font-semibold">Източник на поръчката</h2>
      {hasLast
        ? <TouchBlock title={sameTouch ? 'Първо и последно посещение' : 'Довело до поръчката (последен източник)'} t={last} />
        : <p className="text-muted">Последно посещение: директно</p>}
      {first && !sameTouch && <TouchBlock title="Първо посещение" t={first} />}
      <div className="space-y-1.5 pt-3 border-t border-border">
        <Row k="Посещения" v={visits ? String(visits) : null} />
        <Row k="От първо посещение" v={daysBetween(firstSeen, order.created_at)} />
      </div>
    </div>
  )
}
