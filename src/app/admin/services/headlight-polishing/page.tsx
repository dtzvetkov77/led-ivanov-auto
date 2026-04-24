'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type BeforeAfterPair = {
  id: string
  service: string
  before_url: string
  after_url: string
  label: string | null
  position: number
}

const SERVICE = 'headlight-polishing'

export default function AdminHeadlightPolishingPage() {
  const [pairs, setPairs] = useState<BeforeAfterPair[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [label, setLabel] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/admin/service-before-after?service=${SERVICE}`)
      .then(r => r.json())
      .then(data => { setPairs(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
    const beforeInput = form.querySelector('input[name="before"]') as HTMLInputElement
    const afterInput = form.querySelector('input[name="after"]') as HTMLInputElement
    const beforeFile = beforeInput.files?.[0]
    const afterFile = afterInput.files?.[0]
    if (!beforeFile || !afterFile) { setError('Избери и двете снимки'); return }

    setUploading(true)
    setError(null)
    const data = new FormData()
    data.append('before', beforeFile)
    data.append('after', afterFile)
    data.append('service', SERVICE)
    data.append('label', label)
    data.append('position', String(pairs.length))

    const res = await fetch('/api/admin/service-before-after', { method: 'POST', body: data })
    const result = await res.json()
    setUploading(false)
    if (!res.ok) { setError(result.error ?? 'Грешка при качване'); return }
    setPairs(prev => [...prev, result])
    setLabel('')
    beforeInput.value = ''
    afterInput.value = ''
  }

  async function handleDelete(id: string) {
    await fetch('/api/admin/service-before-after', { method: 'DELETE', body: JSON.stringify({ id }), headers: { 'Content-Type': 'application/json' } })
    setPairs(prev => prev.filter(p => p.id !== id))
  }

  if (loading) return <div className="flex items-center justify-center py-24 text-muted text-sm">Зареждане...</div>

  const fileCls = 'flex-1 flex items-center gap-3 bg-background border border-border hover:border-accent/50 rounded-xl px-4 py-2.5 cursor-pointer transition-colors group'

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/services" className="text-muted hover:text-white transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <h1 className="text-2xl font-bold">Полиране на фарове</h1>
        <Link href="/services/headlight-polishing" target="_blank" className="ml-auto text-sm text-muted hover:text-white transition-colors">
          Преглед →
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-5">Добави двойка ПРЕДИ / СЛЕД</h2>
        <form onSubmit={handleUpload} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <label className={fileCls}>
              <svg className="w-5 h-5 text-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-sm text-muted group-hover:text-white transition-colors">ПРЕДИ снимка *</span>
              <input type="file" name="before" accept="image/*" required className="hidden" />
            </label>
            <label className={fileCls}>
              <svg className="w-5 h-5 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-sm text-muted group-hover:text-white transition-colors">СЛЕД снимка *</span>
              <input type="file" name="after" accept="image/*" required className="hidden" />
            </label>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="Описание (напр. BMW 5 серия — пожълтели фарове)"
              className="flex-1 bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
            />
            <button
              type="submit"
              disabled={uploading}
              className="shrink-0 inline-flex items-center gap-2 bg-accent text-black font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-accent/90 disabled:opacity-50 transition-colors"
            >
              {uploading ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              )}
              {uploading ? 'Качване...' : 'Добави двойка'}
            </button>
          </div>
          {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>}
        </form>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-5">Двойки ПРЕДИ / СЛЕД ({pairs.length})</h2>
        {pairs.length === 0 ? (
          <p className="text-center text-muted text-sm py-8">Няма добавени двойки</p>
        ) : (
          <div className="space-y-4">
            {pairs.map(pair => (
              <div key={pair.id} className="bg-background border border-border rounded-xl overflow-hidden">
                <div className="grid grid-cols-2">
                  <div className="relative aspect-video border-r border-border">
                    <img src={pair.before_url} alt="Преди" className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-0.5 rounded-full">ПРЕДИ</span>
                  </div>
                  <div className="relative aspect-video">
                    <img src={pair.after_url} alt="След" className="w-full h-full object-cover" />
                    <span className="absolute top-2 right-2 bg-accent/90 text-white text-xs font-bold px-2 py-0.5 rounded-full">СЛЕД</span>
                  </div>
                </div>
                <div className="px-4 py-3 flex items-center justify-between gap-3 border-t border-border">
                  <p className="text-xs text-muted truncate">{pair.label ?? '—'}</p>
                  <button
                    onClick={() => handleDelete(pair.id)}
                    className="shrink-0 text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Изтрий
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
