'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { uploadFile } from '@/lib/upload'
import type { Product, Category, Make } from '@/lib/types'

type Props = {
  product?: Product
  categories: Category[]
  makes: Make[]
  selectedCategoryIds?: string[]
  selectedMakeIds?: string[]
}

export default function ProductForm({ product, categories, makes, selectedCategoryIds = [], selectedMakeIds = [] }: Props) {
  const router = useRouter()
  const isNew = !product
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    short_description: product?.short_description ?? '',
    price: String(product?.price ?? ''),
    sale_price: String(product?.sale_price ?? ''),
    published: product?.published ?? true,
    position: String(product?.position ?? 0),
  })
  const [categoryIds, setCategoryIds] = useState<string[]>(selectedCategoryIds)
  const [makeIds, setMakeIds] = useState<string[]>(selectedMakeIds)
  const [images, setImages] = useState<string[]>(product?.images ?? [])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }))

  const slugify = (text: string) =>
    text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')

  const toggleCategory = (id: string) =>
    setCategoryIds(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])

  const toggleMake = (id: string) =>
    setMakeIds(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id])

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    setError('')
    const folder = product?.slug ?? `new-${Date.now()}`
    const uploaded: string[] = []
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      try {
        const url = await uploadFile(file, path)
        uploaded.push(url)
      } catch (e: any) {
        setError(`Грешка при качване: ${e.message}`)
      }
    }
    setImages(prev => [...prev, ...uploaded])
    setUploading(false)
  }

  const removeImage = (idx: number) => setImages(prev => prev.filter((_, i) => i !== idx))

  const moveImage = (from: number, to: number) => {
    setImages(prev => {
      const arr = [...prev]
      const [item] = arr.splice(from, 1)
      arr.splice(to, 0, item)
      return arr
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const supabase = createClient()

    const payload = {
      name: form.name.trim(),
      slug: product?.slug ?? slugify(form.name),
      description: form.description || null,
      short_description: form.short_description || null,
      price: parseFloat(form.price),
      sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
      category_id: categoryIds[0] ?? null,
      images,
      published: form.published,
      position: parseInt(form.position, 10),
    }

    let productId = product?.id
    if (isNew) {
      const { data, error: err } = await supabase.from('products').insert(payload).select('id').single()
      if (err) { setError(err.message); setSaving(false); return }
      productId = data.id
    } else {
      const { error: err } = await supabase.from('products').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', product.id)
      if (err) { setError(err.message); setSaving(false); return }
    }

    // Sync product_categories
    await supabase.from('product_categories').delete().eq('product_id', productId)
    if (categoryIds.length > 0) {
      await supabase.from('product_categories').insert(categoryIds.map(cid => ({ product_id: productId, category_id: cid })))
    }

    // Sync product_makes
    await supabase.from('product_makes').delete().eq('product_id', productId)
    if (makeIds.length > 0) {
      await supabase.from('product_makes').insert(makeIds.map(mid => ({ product_id: productId, make_id: mid })))
    }

    router.push('/admin/products')
    router.refresh()
  }

  const inputCls = 'w-full bg-[#0a0a0a] border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent transition-colors'

  const parentCategories = categories.filter(c => !c.parent_id)

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>}

      {/* Basic fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs text-muted mb-1.5 uppercase tracking-wider">Наименование *</label>
          <input type="text" value={form.name} onChange={set('name')} required className={inputCls} />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1.5 uppercase tracking-wider">Цена *</label>
          <input type="number" value={form.price} onChange={set('price')} required step="0.01" min="0" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1.5 uppercase tracking-wider">Промо цена</label>
          <input type="number" value={form.sale_price} onChange={set('sale_price')} step="0.01" min="0" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1.5 uppercase tracking-wider">Позиция</label>
          <input type="number" value={form.position} onChange={set('position')} min="0" className={inputCls} />
        </div>
      </div>

      <div>
        <label className="block text-xs text-muted mb-1.5 uppercase tracking-wider">Кратко описание</label>
        <textarea value={form.short_description} onChange={set('short_description')} rows={2} className={inputCls} />
      </div>
      <div>
        <label className="block text-xs text-muted mb-1.5 uppercase tracking-wider">Описание</label>
        <textarea value={form.description} onChange={set('description')} rows={6} className={inputCls} />
      </div>

      {/* Categories */}
      <div className="bg-[#0a0a0a] border border-border rounded-xl p-4">
        <p className="text-xs text-muted uppercase tracking-wider mb-3 font-medium">Категории</p>
        {parentCategories.length === 0 ? (
          <p className="text-xs text-muted">Няма категории</p>
        ) : (
          <div className="space-y-3">
            {parentCategories.map(parent => {
              const children = categories.filter(c => c.parent_id === parent.id)
              return (
                <div key={parent.id}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={categoryIds.includes(parent.id)}
                      onChange={() => toggleCategory(parent.id)}
                      className="accent-red-600 w-4 h-4 shrink-0"
                    />
                    <span className="text-sm font-medium text-white">{parent.name}</span>
                  </label>
                  {children.length > 0 && (
                    <div className="ml-6 mt-1.5 space-y-1.5">
                      {children.map(child => (
                        <label key={child.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={categoryIds.includes(child.id)}
                            onChange={() => toggleCategory(child.id)}
                            className="accent-red-600 w-3.5 h-3.5 shrink-0"
                          />
                          <span className="text-sm text-muted">{child.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Makes (compatibility) */}
      {makes.length > 0 && (
        <div className="bg-[#0a0a0a] border border-border rounded-xl p-4">
          <p className="text-xs text-muted uppercase tracking-wider mb-3 font-medium">Съвместимост — марки</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {makes.map(make => (
              <label key={make.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={makeIds.includes(make.id)}
                  onChange={() => toggleMake(make.id)}
                  className="accent-red-600 w-4 h-4 shrink-0"
                />
                <span className="text-sm text-white">{make.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Image upload */}
      <div>
        <label className="block text-xs text-muted mb-2 uppercase tracking-wider">Изображения</label>
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {images.map((url, i) => (
              <div key={url} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-border bg-surface shrink-0">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  {i > 0 && (
                    <button type="button" onClick={() => moveImage(i, i - 1)}
                      className="w-7 h-7 rounded bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                  {i < images.length - 1 && (
                    <button type="button" onClick={() => moveImage(i, i + 1)}
                      className="w-7 h-7 rounded bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                  <button type="button" onClick={() => removeImage(i)}
                    className="w-7 h-7 rounded bg-red-600/80 hover:bg-red-600 flex items-center justify-center text-white transition-colors">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
                {i === 0 && <span className="absolute top-1 left-1 text-[9px] font-bold bg-accent text-white px-1 rounded">MAIN</span>}
              </div>
            ))}
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
          className="flex items-center justify-center gap-2 w-full py-6 border-2 border-dashed border-border hover:border-accent rounded-xl text-muted hover:text-white transition-colors disabled:opacity-50 text-sm">
          {uploading ? (
            <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>Качване...</>
          ) : (
            <><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/></svg>Качи снимки (може да изберете повече)</>
          )}
        </button>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.published} onChange={set('published')} className="accent-red-600 w-4 h-4" />
        <span className="text-sm">Публикуван</span>
      </label>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving || uploading}
          className="bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-lg font-semibold disabled:opacity-40 transition-colors text-sm">
          {saving ? 'Запис...' : isNew ? 'Създай продукт' : 'Запази промените'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-6 py-2.5 rounded-lg font-semibold text-sm text-muted hover:text-white border border-border hover:border-white/30 transition-colors">
          Отказ
        </button>
      </div>
    </form>
  )
}
