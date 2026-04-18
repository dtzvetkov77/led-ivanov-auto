'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (authError) { setError('Грешен имейл или парола'); return }
    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-lg p-8 w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-center mb-2">Admin вход</h1>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Имейл"
          required
          className="w-full bg-background border border-border rounded px-3 py-2 text-white"
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Парола"
          required
          className="w-full bg-background border border-border rounded px-3 py-2 text-white"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent hover:bg-accent-hover text-white py-2 rounded font-semibold disabled:opacity-50 transition-colors"
        >
          {loading ? 'Влизане...' : 'Влез'}
        </button>
      </form>
    </div>
  )
}
