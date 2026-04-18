'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/lib/types'

type Props = { category?: Category }

export default function CategoryForm({ category }: Props) {
  const router = useRouter()
  const isNew = !category
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: category?.name ?? '',
    slug: category?.slug ?? '',
    description: category?.description ?? '',
    image_url: category?.image_url ?? '',
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const slugify = (text: string) =>
    text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setForm(f => ({ ...f, name, ...(isNew ? { slug: slugify(name) } : {}) }))
  }

  const handleFile = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    setError('')
    const supabase = createClient()
    const file = files[0]
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const slug = form.slug || `cat-${Date.now()}`
    const path = `categories/${slug}-${Date.now()}.${ext}`

    const { error: upErr } = await supabase.storage
      .from('product-images')
      .upload(path, file, { upsert: true })

    if (upErr) { setError(`Грешка при качване: ${upErr.message}`); setUploading(false); return }

    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    setForm(f => ({ ...f, image_url: data.publicUrl }))
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const supabase = createClient()
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || slugify(form.name),
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
    }
    if (isNew) {
      const { error: err } = await supabase.from('categories').insert(payload)
      if (err) { setError(err.message); setSaving(false); return }
    } else {
      const { error: err } = await supabase.from('categories').update(payload).eq('id', category.id)
      if (err) { setError(err.message); setSaving(false); return }
    }
    router.push('/admin/categories')
    router.refresh()
  }

  const inputCls = 'w-full bg-[#0a0a0a] border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent transition-colors'

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      {error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>}

      <div>
        <label className="block text-xs text-muted mb-1.5 uppercase tracking-wider">Наименование *</label>
        <input type="text" value={form.name} onChange={handleNameChange} required className={inputCls} />
      </div>
      <div>
        <label className="block text-xs text-muted mb-1.5 uppercase tracking-wider">Slug</label>
        <input type="text" value={form.slug} onChange={set('slug')} className={inputCls} placeholder="auto-generated" />
      </div>
      <div>
        <label className="block text-xs text-muted mb-1.5 uppercase tracking-wider">Описание</label>
        <textarea value={form.description} onChange={set('description')} rows={3} className={inputCls} />
      </div>

      {/* Image */}
      <div>
        <label className="block text-xs text-muted mb-2 uppercase tracking-wider">Изображение</label>
        {form.image_url && (
          <div className="relative mb-3 w-full max-w-xs rounded-xl overflow-hidden border border-border">
            <img src={form.image_url} alt="" className="w-full h-40 object-cover" />
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, image_url: '' }))}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => handleFile(e.target.files)}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-border hover:border-accent rounded-xl text-muted hover:text-white transition-colors text-sm disabled:opacity-50"
        >
          {uploading ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              Качване...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {form.image_url ? 'Смени снимката' : 'Качи снимка'}
            </>
          )}
        </button>
        <p className="text-xs text-muted mt-1.5">или въведи URL:</p>
        <input type="url" value={form.image_url} onChange={set('image_url')} placeholder="https://..." className={`${inputCls} mt-1`} />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving || uploading}
          className="bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-lg font-semibold disabled:opacity-40 transition-colors text-sm">
          {saving ? 'Запис...' : isNew ? 'Създай категория' : 'Запази промените'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-6 py-2.5 rounded-lg font-semibold text-sm text-muted hover:text-white border border-border hover:border-white/30 transition-colors">
          Отказ
        </button>
      </div>
    </form>
  )
}
