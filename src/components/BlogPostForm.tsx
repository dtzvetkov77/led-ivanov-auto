'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false })

type InitialPost = {
  id: string
  slug: string
  title: string
  meta_description: string | null
  cover_image: string | null
  content: string
  reading_time: number
  published: boolean
}

type Props = {
  initial?: InitialPost
}

const inputCls = 'bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors'

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin shrink-0" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  )
}

export default function BlogPostForm({ initial }: Props) {
  const router = useRouter()
  const isEdit = !!initial

  const [title, setTitle] = useState(initial?.title ?? '')
  const [meta, setMeta] = useState(initial?.meta_description ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [readingTime, setReadingTime] = useState(initial?.reading_time ?? 5)
  const [published, setPublished] = useState(initial?.published ?? false)
  const [coverImage, setCoverImage] = useState<string | null>(initial?.cover_image ?? null)

  const [uploadingCover, setUploadingCover] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const form = new FormData()
    form.append('file', file)
    form.append('path', `blog/covers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
    const data = await res.json()
    setUploadingCover(false)
    if (res.ok) setCoverImage(data.url)
    e.target.value = ''
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setSaveMsg('Грешка: Заглавието е задължително'); return }
    setSaving(true)
    setSaveMsg(null)

    const body = {
      title,
      meta_description: meta || null,
      cover_image: coverImage,
      content,
      published,
      reading_time: readingTime,
    }

    const res = isEdit
      ? await fetch(`/api/admin/blog/${initial!.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      : await fetch('/api/admin/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setSaveMsg(`Грешка: ${data.error ?? 'Неизвестна грешка'}`)
      return
    }

    if (!isEdit) {
      router.push(`/admin/blog/${data.id}`)
    } else {
      setSaveMsg('Запазено успешно')
      setTimeout(() => setSaveMsg(null), 3000)
    }
  }

  async function handleDelete() {
    if (!initial || !confirm(`Изтрийте статията "${initial.title}"? Действието е необратимо.`)) return
    setDeleting(true)
    await fetch(`/api/admin/blog/${initial.id}`, { method: 'DELETE' })
    router.push('/admin/blog')
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/blog" className="text-muted hover:text-white transition-colors" title="Назад">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 16l-4-4m0 0l4-4m-4 4h18" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <h1 className="text-2xl font-bold truncate">
          {isEdit ? (initial!.title || 'Редактиране') : 'Нова статия'}
        </h1>
        {isEdit && (
          <Link
            href={`/blog/${initial!.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto shrink-0 text-sm text-muted hover:text-white transition-colors"
          >
            Преглед →
          </Link>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Main info card */}
        <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">Основна информация</h2>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted uppercase tracking-wide">Заглавие *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              placeholder="Заглавие на статията"
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted uppercase tracking-wide">Мета описание</label>
            <textarea
              rows={2}
              value={meta}
              onChange={e => setMeta(e.target.value)}
              maxLength={200}
              placeholder="Кратко описание за търсачките (до 160 знака)"
              className={`${inputCls} resize-none`}
            />
            <p className="text-xs text-muted">{meta.length}/200</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Cover image */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted uppercase tracking-wide">Cover снимка</label>
              <div className="flex items-center gap-3 flex-wrap">
                {coverImage && (
                  <img src={coverImage} alt="cover" className="w-14 h-14 object-cover rounded-lg border border-border shrink-0" />
                )}
                <label className="flex items-center gap-2 bg-background border border-border hover:border-accent/50 rounded-xl px-3 py-2.5 cursor-pointer transition-colors text-sm text-muted hover:text-white">
                  {uploadingCover ? <Spinner /> : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {uploadingCover ? 'Качване...' : coverImage ? 'Смени' : 'Качи снимка'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploadingCover} />
                </label>
                {coverImage && (
                  <button type="button" onClick={() => setCoverImage(null)} className="text-xs text-red-400 hover:text-red-300">
                    Премахни
                  </button>
                )}
              </div>
            </div>

            {/* Reading time */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted uppercase tracking-wide">Минути за четене</label>
              <input
                type="number"
                min={1}
                max={60}
                value={readingTime}
                onChange={e => setReadingTime(Number(e.target.value))}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Content editor */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted uppercase tracking-wide">Съдържание</label>
          <RichTextEditor value={content} onChange={setContent} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              role="switch"
              aria-checked={published}
              onClick={() => setPublished(v => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${published ? 'bg-accent' : 'bg-border'}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${published ? 'translate-x-5' : ''}`} />
            </div>
            <span className="text-sm text-muted">{published ? 'Публикувана' : 'Скрита'}</span>
          </label>

          <div className="flex items-center gap-3">
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Изтриване...' : 'Изтрий статията'}
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-accent text-black font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-accent/90 disabled:opacity-50 transition-colors"
            >
              {saving && <Spinner />}
              {saving ? 'Запазване...' : isEdit ? 'Запази промените' : 'Създай статията'}
            </button>
          </div>
        </div>

        {saveMsg && (
          <div className={`text-sm px-4 py-3 rounded-xl border ${
            saveMsg.startsWith('Грешка')
              ? 'text-red-400 bg-red-500/10 border-red-500/20'
              : 'text-green-400 bg-green-500/10 border-green-500/20'
          }`}>
            {saveMsg}
          </div>
        )}
      </form>
    </div>
  )
}
