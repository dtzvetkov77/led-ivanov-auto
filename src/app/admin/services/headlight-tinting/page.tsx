'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type ServiceImage = {
  id: string
  service: string
  url: string
  caption: string | null
  position: number
}

const SERVICE = 'headlight-tinting'
const TITLE = 'Фолиране на фарове'

export default function AdminHeadlightTintingPage() {
  const [images, setImages] = useState<ServiceImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/admin/service-images?service=${SERVICE}`)
      .then(r => r.json())
      .then(data => { setImages(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    const input = (e.currentTarget as HTMLFormElement).querySelector('input[type="file"]') as HTMLInputElement
    const file = input.files?.[0]
    if (!file) { setError('Избери снимка'); return }
    setUploading(true)
    setError(null)

    const form = new FormData()
    form.append('file', file)
    form.append('service', SERVICE)
    form.append('caption', caption)
    form.append('position', String(images.length))

    try {
      const res = await fetch('/api/admin/service-images', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Грешка при качване'); return }
      setImages(prev => [...prev, data])
      setCaption('')
      setFileName('')
      input.value = ''
    } catch {
      setError('Неуспешна връзка — опитай отново')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch('/api/admin/service-images', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
        headers: { 'Content-Type': 'application/json' },
      })
      setImages(prev => prev.filter(i => i.id !== id))
    } catch {
      // ignore
    }
  }

  if (loading) return <div className="flex items-center justify-center py-24 text-muted text-sm">Зареждане...</div>

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/services" className="text-muted hover:text-white transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <h1 className="text-xl font-bold">{TITLE}</h1>
        <Link href="/services/headlight-tinting" target="_blank" className="ml-auto text-sm text-muted hover:text-white transition-colors">
          Преглед →
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-4 md:p-6 mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">Добави снимка</h2>
        <form onSubmit={handleUpload} className="space-y-3">
          <label className="flex items-center gap-3 bg-background border border-border hover:border-accent/50 rounded-xl px-4 py-2.5 cursor-pointer transition-colors">
            <svg className="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-sm text-muted truncate min-w-0 flex-1">
              {fileName || 'Избери снимка *'}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => setFileName(e.target.files?.[0]?.name ?? '')}
            />
          </label>
          <input
            type="text"
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="Надпис (незадължително)"
            className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
          />
          <button
            type="submit"
            disabled={uploading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent text-black font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-accent/90 disabled:opacity-50 transition-colors"
          >
            {uploading ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
            {uploading ? 'Качване...' : 'Качи'}
          </button>
          {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>}
        </form>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-4 md:p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">Галерия ({images.length})</h2>
        {images.length === 0 ? (
          <p className="text-center text-muted text-sm py-8">Няма добавени снимки</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {images.map(img => (
              <div key={img.id} className="relative rounded-xl overflow-hidden bg-background border border-border">
                <div className="aspect-square">
                  <img src={img.url} alt={img.caption ?? ''} className="w-full h-full object-cover" />
                </div>
                {img.caption && (
                  <div className="bg-black/70 text-xs text-white px-2 py-1 truncate">{img.caption}</div>
                )}
                <button
                  onClick={() => handleDelete(img.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-600/90 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
