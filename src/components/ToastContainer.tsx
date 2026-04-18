'use client'
import { useEffect, useState } from 'react'

type Toast = { id: number; message: string; type: 'success' | 'error' }

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const handler = (e: Event) => {
      const { message, type } = (e as CustomEvent<{ message: string; type: 'success' | 'error' }>).detail
      const id = Date.now()
      setToasts(prev => [...prev, { id, message, type }])
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
    }
    window.addEventListener('toast', handler)
    return () => window.removeEventListener('toast', handler)
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 left-0 right-0 z-100 flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`toast-animate flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold text-white ${
            toast.type === 'success'
              ? 'bg-surface border border-green-500/40'
              : 'bg-surface border border-red-500/40'
          }`}
        >
          {toast.type === 'success' ? (
            <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
              <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          ) : (
            <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shrink-0">
              <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
              </svg>
            </span>
          )}
          {toast.message}
        </div>
      ))}
    </div>
  )
}
