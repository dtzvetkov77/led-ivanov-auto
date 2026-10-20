'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Result = { checked: number; sent: number; skipped: number; failed: number; errors: string[]; error?: string }

export default function AbandonedCartsButton({ disabled }: { disabled: boolean }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [text, setText] = useState<{ ok: boolean; msg: string } | null>(null)

  async function run() {
    setBusy(true)
    setText(null)
    try {
      const res = await fetch('/api/admin/abandoned-carts', { method: 'POST' })
      const r = (await res.json()) as Result
      if (!res.ok) throw new Error(r.error ?? 'Грешка')
      setText({
        ok: r.failed === 0,
        msg: `Проверени: ${r.checked} · пратени: ${r.sent} · пропуснати: ${r.skipped}${r.failed ? ` · грешки: ${r.failed} (${r.errors[0] ?? ''})` : ''}`,
      })
      router.refresh()
    } catch (e) {
      setText({ ok: false, msg: (e as Error).message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={run}
        disabled={busy || disabled}
        className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold disabled:opacity-50 transition-colors"
      >
        {busy ? 'Праща се...' : 'Прати напомнянията сега'}
      </button>
      {text && <p className={`text-sm ${text.ok ? 'text-green-400' : 'text-red-400'}`}>{text.msg}</p>}
    </div>
  )
}
