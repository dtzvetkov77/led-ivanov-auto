'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Partner = {
  id: string
  slug: string
  name: string
  city: string
  address: string
  phone: string
  hours: string
  contact_person: string | null
  description: string | null
  cover_image: string | null
  logo_url: string | null
  published: boolean
  position: number
}

type PartnerImage = {
  id: string
  partner_id: string
  url: string
  caption: string | null
  position: number
}

export default function AdminPartnerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [partner, setPartner] = useState<Partner | null>(null)
  const [images, setImages] = useState<PartnerImage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  // Cover image upload
  const [uploadingCover, setUploadingCover] = useState(false)
  const [coverError, setCoverError] = useState<string | null>(null)

  // Logo upload
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)

  // Image add form
  const [imgCaption, setImgCaption] = useState('')
  const [addingImg, setAddingImg] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const [{ data: p }, { data: imgs }] = await Promise.all([
        supabase.from('partners').select('*').eq('id', id).single(),
        supabase.from('partner_images').select('*').eq('partner_id', id).order('position'),
      ])
      setPartner(p as Partner)
      setImages((imgs ?? []) as PartnerImage[])
      setLoading(false)
    }
    load()
  }, [id])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!partner) return
    setSaving(true)
    setSaveMsg(null)
    const { error } = await supabase
      .from('partners')
      .update({
        name: partner.name,
        city: partner.city,
        address: partner.address,
        phone: partner.phone,
        hours: partner.hours,
        contact_person: partner.contact_person || null,
        description: partner.description || null,
        cover_image: partner.cover_image || null,
        logo_url: partner.logo_url || null,
        published: partner.published,
      })
      .eq('id', id)
    setSaving(false)
    setSaveMsg(error ? `Грешка: ${error.message}` : 'Запазено успешно')
    setTimeout(() => setSaveMsg(null), 3000)
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    setCoverError(null)
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const form = new FormData()
    form.append('file', file)
    form.append('path', `partners/covers/${id}-cover.${ext}`)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
    const data = await res.json()
    setUploadingCover(false)
    if (!res.ok) { setCoverError(data.error ?? 'Грешка при качване'); return }
    setPartner(prev => prev ? { ...prev, cover_image: data.url } : prev)
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    setLogoError(null)
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const form = new FormData()
    form.append('file', file)
    form.append('path', `partners/logos/${id}-logo.${ext}`)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
    const data = await res.json()
    setUploadingLogo(false)
    if (!res.ok) { setLogoError(data.error ?? 'Грешка при качване'); return }
    setPartner(prev => prev ? { ...prev, logo_url: data.url } : prev)
  }

  async function handleAddImage(e: React.FormEvent) {
    e.preventDefault()
    const input = (e.currentTarget as HTMLFormElement).querySelector('input[type="file"]') as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    setAddingImg(true)
    setUploadError(null)

    const form = new FormData()
    form.append('file', file)
    form.append('partner_id', id)

    const res = await fetch('/api/admin/upload-partner-image', { method: 'POST', body: form })
    if (!res.ok) {
      const d = await res.json()
      setUploadError(d.error ?? 'Грешка при качване')
      setAddingImg(false)
      return
    }
    const { url } = await res.json()

    const nextPos = images.length > 0 ? Math.max(...images.map(i => i.position)) + 1 : 1
    const { data, error } = await supabase
      .from('partner_images')
      .insert({ partner_id: id, url, caption: imgCaption.trim() || null, position: nextPos })
      .select()
      .single()
    setAddingImg(false)
    if (!error && data) {
      setImages(prev => [...prev, data as PartnerImage])
      setImgCaption('')
      input.value = ''
    }
  }

  async function handleDeleteImage(imgId: string) {
    await supabase.from('partner_images').delete().eq('id', imgId)
    setImages(prev => prev.filter(i => i.id !== imgId))
  }

  const field = (label: string, key: keyof Partner, type = 'text') => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-muted uppercase tracking-wide">{label}</label>
      <input
        type={type}
        value={(partner?.[key] as string) ?? ''}
        onChange={e => setPartner(prev => prev ? { ...prev, [key]: e.target.value } : prev)}
        className="bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
      />
    </div>
  )

  if (loading) return <div className="flex items-center justify-center py-24 text-muted text-sm">Зареждане...</div>
  if (!partner) return <div className="text-center py-24 text-muted">Партньорът не е намерен</div>

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/partners" className="text-muted hover:text-white transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 16l-4-4m0 0l4-4m-4 4h18" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <h1 className="text-2xl font-bold">{partner.name}</h1>
        <Link href={`/partners/${partner.slug}`} target="_blank" className="ml-auto text-sm text-muted hover:text-white transition-colors">
          Преглед →
        </Link>
      </div>

      {/* Edit form */}
      <div className="bg-surface border border-border rounded-2xl p-6 mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-5">Информация</h2>
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field('Име', 'name')}
          {field('Град', 'city')}
          {field('Адрес', 'address')}
          {field('Телефон', 'phone')}
          {field('Работно време', 'hours')}
          {field('Лице за контакт', 'contact_person')}
          {/* Cover image upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted uppercase tracking-wide">Cover снимка</label>
            <div className="flex items-center gap-3">
              {partner.cover_image && (
                <img src={partner.cover_image} alt="cover" className="w-12 h-12 object-cover rounded-lg border border-border" />
              )}
              <label className="flex items-center gap-2 bg-background border border-border hover:border-accent/50 rounded-xl px-3 py-2.5 cursor-pointer transition-colors text-sm text-muted hover:text-white">
                {uploadingCover ? (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
                {uploadingCover ? 'Качване...' : (partner.cover_image ? 'Смени снимката' : 'Качи cover снимка')}
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploadingCover} />
              </label>
              {partner.cover_image && (
                <button type="button" onClick={() => setPartner(p => p ? { ...p, cover_image: null } : p)} className="text-xs text-red-400 hover:text-red-300">Премахни</button>
              )}
            </div>
            {coverError && <p className="text-xs text-red-400">{coverError}</p>}
          </div>

          {/* Logo upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted uppercase tracking-wide">Лого</label>
            <div className="flex items-center gap-3">
              {partner.logo_url && (
                <img src={partner.logo_url} alt="лого" className="w-12 h-12 object-contain rounded-lg border border-border bg-white/5" />
              )}
              <label className="flex items-center gap-2 bg-background border border-border hover:border-accent/50 rounded-xl px-3 py-2.5 cursor-pointer transition-colors text-sm text-muted hover:text-white">
                {uploadingLogo ? (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
                {uploadingLogo ? 'Качване...' : (partner.logo_url ? 'Смени лого' : 'Качи лого')}
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
              </label>
              {partner.logo_url && (
                <button type="button" onClick={() => setPartner(p => p ? { ...p, logo_url: null } : p)} className="text-xs text-red-400 hover:text-red-300">Премахни</button>
              )}
            </div>
            {logoError && <p className="text-xs text-red-400">{logoError}</p>}
          </div>

          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="text-xs text-muted uppercase tracking-wide">Описание</label>
            <textarea
              rows={3}
              value={partner.description ?? ''}
              onChange={e => setPartner(prev => prev ? { ...prev, description: e.target.value } : prev)}
              className="bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors resize-none"
            />
          </div>

          <div className="sm:col-span-2 flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setPartner(prev => prev ? { ...prev, published: !prev.published } : prev)}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${partner.published ? 'bg-accent' : 'bg-border'}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${partner.published ? 'translate-x-5' : ''}`} />
              </div>
              <span className="text-sm text-muted">{partner.published ? 'Публикуван' : 'Скрит'}</span>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-accent text-black font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-accent/90 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Запазване...' : 'Запази промените'}
            </button>
          </div>

          {saveMsg && (
            <div className={`sm:col-span-2 text-sm px-4 py-3 rounded-xl border ${saveMsg.startsWith('Грешка') ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-green-400 bg-green-500/10 border-green-500/20'}`}>
              {saveMsg}
            </div>
          )}
        </form>
      </div>

      {/* Gallery management */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-5">Галерия</h2>

        {/* Add image form */}
        <form onSubmit={handleAddImage} className="space-y-3 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex-1 flex items-center gap-3 bg-background border border-border hover:border-accent/50 rounded-xl px-4 py-2.5 cursor-pointer transition-colors group">
              <svg className="w-5 h-5 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-sm text-muted group-hover:text-white transition-colors">Избери снимка</span>
              <input type="file" accept="image/*" required className="hidden" />
            </label>
            <input
              type="text"
              value={imgCaption}
              onChange={e => setImgCaption(e.target.value)}
              placeholder="Надпис (незадължително)"
              className="sm:w-52 bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
            />
            <button
              type="submit"
              disabled={addingImg}
              className="shrink-0 inline-flex items-center gap-2 bg-accent text-black font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-accent/90 disabled:opacity-50 transition-colors"
            >
              {addingImg ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {addingImg ? 'Качване...' : 'Качи'}
            </button>
          </div>
          {uploadError && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{uploadError}</p>
          )}
        </form>

        {/* Image grid */}
        {images.length === 0 ? (
          <p className="text-center text-muted text-sm py-8">Няма добавени снимки</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map(img => (
              <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden bg-background border border-border">
                <img
                  src={img.url}
                  alt={img.caption ?? ''}
                  className="w-full h-full object-cover"
                />
                {img.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-xs text-white px-2 py-1 truncate">
                    {img.caption}
                  </div>
                )}
                <button
                  onClick={() => handleDeleteImage(img.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Изтрий"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
