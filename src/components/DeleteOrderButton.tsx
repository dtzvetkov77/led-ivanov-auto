'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteOrderButton({ orderId, redirectAfter = false }: { orderId: string; redirectAfter?: boolean }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/orders/${orderId}`, { method: 'DELETE' })
    if (res.ok) {
      if (redirectAfter) router.push('/admin/orders')
      else router.refresh()
    } else {
      alert('Грешка при изтриване')
      setLoading(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted">Сигурен ли си?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Изтриване...' : 'Да, изтрий'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-muted hover:text-white px-3 py-1.5 rounded-lg border border-border transition-colors"
        >
          Откажи
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors border border-red-900/30"
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Изтрий
    </button>
  )
}
