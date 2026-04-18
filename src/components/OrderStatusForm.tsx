'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { OrderStatus } from '@/lib/types'

const STATUSES: OrderStatus[] = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled']
const LABELS: Record<OrderStatus, string> = {
  new: 'Нова', confirmed: 'Потвърдена', shipped: 'Изпратена', delivered: 'Доставена', cancelled: 'Отказана',
}

type Props = { orderId: string; currentStatus: OrderStatus }

export default function OrderStatusForm({ orderId, currentStatus }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<OrderStatus>(currentStatus)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId)
    setSaving(false)
    router.refresh()
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-4 flex items-center gap-4">
      <label className="text-muted text-sm">Статус:</label>
      <select value={status} onChange={e => setStatus(e.target.value as OrderStatus)}
        className="bg-[#0a0a0a] border border-border rounded px-3 py-2 text-sm text-white flex-1">
        {STATUSES.map(s => <option key={s} value={s}>{LABELS[s]}</option>)}
      </select>
      <button onClick={handleSave} disabled={saving || status === currentStatus}
        className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded text-sm font-semibold disabled:opacity-40 transition-colors">
        {saving ? 'Запис...' : 'Запази'}
      </button>
    </div>
  )
}
