'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { uploadFile } from '@/lib/upload'

type Review = {
  id: string
  name: string
  car: string | null
  text: string
  photo_url: string | null
  stars: number
  published: boolean
  position: number
}

type Props = { review?: Review }

export default function ReviewForm({ review }: Props) {
  const router = useRouter()
  const isNew = !review
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: review?.name ?? '',
    car: review?.car ?? '',
    text: review?.text ?? '',
    stars: review?.stars ?? 5,
    published: review?.published ?? true,
    position: String(review?.position ?? 0),
    photo_url: review?.photo_url ?? '',
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }))

  const handleFile = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    setError('')
    try {
      const file = files[0]
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const path = `customers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const url = await uploadFile(file, path)
      setForm(f => ({ ...f, photo_url: url }))
    } catch (e: any) {
      setError(`Грешка при качване: ${e.message}`)
    }
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const supabase = createClient()
    const payload = {
      name: form.name.trim(),
      car: form.car.trim() || null,
      text: form.text.trim(),
      stars: Number(form.stars),
      published: form.published,
      position: parseInt(form.position, 10),
      photo_url: form.photo_url.trim() || null,
    }
    if (isNew) {
      const { error: err } = await supabase.from('customer_reviews').insert(payload)
      if (err) { setError(err.message); setSaving(false); return }
    } else {
      const { error: err } = await supabase.from('customer_reviews').update(payload).eq('id', review.id)
      if (err) { setError(err.message); setSaving(false); return }
    }
    router.push('/admin/reviews')
    router.refresh()
  }

  const inputCls = 'w-full bg-[#0a0a0a] border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent transition-colors'

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      {error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs text-muted mb-1.5 uppercase tracking-wider">Ime *</label>
          <input type="text" value={form.name} onChange={set('name')} required className={inputCls} placeholder="Георги Петров" />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1.5 uppercase tracking-wider">Автомобил</label>
          <input type="text" value={form.car} onChange={set('car')} className={inputCls} placeholder="BMW E46" />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1.5 uppercase tracking-wider">Звезди</label>
          <select value={form.stars} onChange={e => setForm(f => ({ ...f, stars: Number(e.target.value) }))} className={inputCls}>
            {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ⭐</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-muted mb-1.5 uppercase tracking-wider">Текст *</label>
          <textarea value={form.text} onChange={set('text')} required rows={4} className={inputCls} placeholder="Много съм доволен! ..." />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1.5 uppercase tracking-wider">Позиция</label>
          <input type="number" value={form.position} onChange={set('position')} min="0" className={inputCls} />
        </div>
      </div>

      {/* Photo */}
      <div>
        <label className="block text-xs text-muted mb-2 uppercase tracking-wider">Снимка на клиента</label>
        {form.photo_url && (
          <div className="relative mb-3 w-24 h-24 rounded-xl overflow-hidden border border-border">
            <img src={form.photo_url} alt="" className="w-full h-full object-cover" />
            <button type="button" onClick={() => setForm(f => ({ ...f, photo_url: '' }))}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-600 transition-colors">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files)} />
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
          className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-border hover:border-accent rounded-xl text-muted hover:text-white transition-colors text-sm disabled:opacity-50">
          {uploading ? 'Качване...' : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {form.photo_url ? 'Смени снимката' : 'Качи снимка'}
            </>
          )}
        </button>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.published} onChange={set('published')} className="accent-red-600 w-4 h-4" />
        <span className="text-sm">Публикувано</span>
      </label>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving || uploading}
          className="bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-lg font-semibold disabled:opacity-40 transition-colors text-sm">
          {saving ? 'Запис...' : isNew ? 'Добави ревю' : 'Запази промените'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-6 py-2.5 rounded-lg font-semibold text-sm text-muted hover:text-white border border-border hover:border-white/30 transition-colors">
          Отказ
        </button>
      </div>
    </form>
  )
}
