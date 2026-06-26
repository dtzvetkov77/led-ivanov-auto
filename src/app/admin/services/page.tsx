'use client'
import { useEffect, useRef, useState } from 'react'

type Pair = {
  id: string
  service: string
  before_url: string
  after_url: string
  label: string | null
  position: number
  published: boolean
}

const SERVICES = [
  { slug: 'headlight-polishing', label: 'Полиране на фарове' },
  { slug: 'headlight-tinting', label: 'Фолиране на фарове' },
  { slug: 'headlight-alignment', label: 'Регулиране на фарове' },
]

async function uploadOne(file: File, path: string): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('path', path)
  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Upload failed')
  return data.url as string
}

export default function AdminServicesPage() {
  const [activeService, setActiveService] = useState(SERVICES[0].slug)
  const [pairs, setPairs] = useState<Pair[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [label, setLabel] = useState('')
  const [beforeName, setBeforeName] = useState('')
  const [afterName, setAfterName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const beforeRef = useRef<HTMLInputElement>(null)
  const afterRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLoading(true)
    setPairs([])
    fetch(`/api/admin/service-before-after?service=${activeService}`)
      .then(r => r.json())
      .then(data => { setPairs(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [activeService])

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    const beforeFile = beforeRef.current?.files?.[0]
    const afterFile = afterRef.current?.files?.[0]
    if (!beforeFile || !afterFile) { setError('Избери и двете снимки'); return }

    setUploading(true)
    setError(null)

    try {
      const ts = Date.now()
      const ext1 = beforeFile.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const ext2 = afterFile.name.split('.').pop()?.toLowerCase() ?? 'jpg'

      const [before_url, after_url] = await Promise.all([
        uploadOne(beforeFile, `services/${activeService}/before-after/${ts}-before.${ext1}`),
        uploadOne(afterFile, `services/${activeService}/before-after/${ts}-after.${ext2}`),
      ])

      const res = await fetch('/api/admin/service-before-after', {
        method: 'POST',
        body: JSON.stringify({ before_url, after_url, label, service: activeService, position: pairs.length }),
        headers: { 'Content-Type': 'application/json' },
      })
      const result = await res.json()
      if (!res.ok) { setError(result.error ?? 'Грешка при запис'); return }

      setPairs(prev => [...prev, result])
      setLabel('')
      setBeforeName('')
      setAfterName('')
      if (beforeRef.current) beforeRef.current.value = ''
      if (afterRef.current) afterRef.current.value = ''
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неуспешно качване')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string) {
    await fetch('/api/admin/service-before-after', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => {})
    setPairs(prev => prev.filter(p => p.id !== id))
  }

  const fileLabelCls = 'flex items-center gap-3 bg-background border border-border hover:border-accent/50 rounded-xl px-4 py-2.5 cursor-pointer transition-colors'
  const uploadIcon = (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold mb-6">Услуги — ПРЕДИ / СЛЕД</h1>

      {/* Service tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {SERVICES.map(s => (
          <button
            key={s.slug}
            onClick={() => { setActiveService(s.slug); setError(null) }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeService === s.slug
                ? 'bg-accent text-black'
                : 'bg-surface border border-border text-muted hover:text-white hover:border-accent/40'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Upload form */}
      <div className="bg-surface border border-border rounded-2xl p-4 md:p-6 mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">Добави двойка ПРЕДИ / СЛЕД</h2>
        <form onSubmit={handleUpload} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className={fileLabelCls}>
              <span className="text-muted">{uploadIcon}</span>
              <span className="text-sm text-muted truncate min-w-0 flex-1">{beforeName || 'ПРЕДИ снимка *'}</span>
              <input
                ref={beforeRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => setBeforeName(e.target.files?.[0]?.name ?? '')}
              />
            </label>
            <label className={fileLabelCls}>
              <span className="text-accent">{uploadIcon}</span>
              <span className="text-sm text-muted truncate min-w-0 flex-1">{afterName || 'СЛЕД снимка *'}</span>
              <input
                ref={afterRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => setAfterName(e.target.files?.[0]?.name ?? '')}
              />
            </label>
          </div>
          <input
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="Описание (напр. BMW 5 серия)"
            className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
          />
          <button
            type="submit"
            disabled={uploading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent text-black font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-accent/90 disabled:opacity-50 transition-colors"
          >
            {uploading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Качване...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Добави двойка
              </>
            )}
          </button>
          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}
        </form>
      </div>

      {/* Pairs list */}
      <div className="bg-surface border border-border rounded-2xl p-4 md:p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">
          {SERVICES.find(s => s.slug === activeService)?.label} ({pairs.length})
        </h2>
        {loading ? (
          <p className="text-center text-muted text-sm py-8">Зареждане...</p>
        ) : pairs.length === 0 ? (
          <p className="text-center text-muted text-sm py-8">Няма добавени двойки</p>
        ) : (
          <div className="space-y-4">
            {pairs.map(pair => (
              <div key={pair.id} className="bg-background border border-border rounded-xl overflow-hidden">
                <div className="grid grid-cols-2">
                  <div className="relative aspect-video border-r border-border overflow-hidden">
                    <img src={pair.before_url} alt="Преди" className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">ПРЕДИ</span>
                  </div>
                  <div className="relative aspect-video overflow-hidden">
                    <img src={pair.after_url} alt="След" className="w-full h-full object-cover" />
                    <span className="absolute top-2 right-2 bg-accent/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">СЛЕД</span>
                  </div>
                </div>
                <div className="px-3 py-2.5 flex items-center justify-between gap-3 border-t border-border">
                  <p className="text-xs text-muted truncate">{pair.label ?? '—'}</p>
                  <button
                    onClick={() => handleDelete(pair.id)}
                    className="shrink-0 flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
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
