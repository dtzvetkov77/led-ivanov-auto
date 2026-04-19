'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { uploadFile } from '@/lib/upload'

type GalleryImage = {
  id: string
  url: string
  caption: string | null
  position: number
  published: boolean
  created_at: string
}

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchImages()
  }, [])

  async function fetchImages() {
    const { data } = await supabase
      .from('gallery_images')
      .select('*')
      .order('position')
    setImages(data ?? [])
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const url = await uploadFile(file, `gallery/${Date.now()}-${file.name}`)
        await fetch('/api/admin/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        })
      }
      await fetchImages()
    } finally {
      setUploading(false)
    }
  }

  async function updateImage(id: string, patch: Partial<GalleryImage>) {
    await supabase.from('gallery_images').update(patch).eq('id', id)
    setImages(prev => prev.map(img => img.id === id ? { ...img, ...patch } : img))
  }

  async function deleteImage(id: string) {
    await supabase.from('gallery_images').delete().eq('id', id)
    setImages(prev => prev.filter(img => img.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Галерия</h1>
        <Link
          href="/gallery"
          target="_blank"
          className="text-sm text-muted hover:text-white transition-colors"
        >
          Преглед →
        </Link>
      </div>

      {/* Drag-and-drop upload area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer mb-8 ${
          dragOver
            ? 'border-accent bg-accent/10'
            : 'border-border bg-surface hover:border-accent/50 hover:bg-surface/80'
        }`}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => {
          e.preventDefault()
          setDragOver(false)
          handleFiles(e.dataTransfer.files)
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <svg className="w-8 h-8 text-accent animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <p className="text-muted text-sm">Качване...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <svg className="w-10 h-10 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-sm text-muted">
              Плъзни снимки или <span className="text-accent font-medium">кликни за качване</span>
            </p>
            <p className="text-xs text-muted/60">PNG, JPG, WebP — множество файлове</p>
          </div>
        )}
      </div>

      {/* Images grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map(img => (
            <div key={img.id} className="bg-surface border border-border rounded-xl overflow-hidden flex flex-col">
              {/* Thumbnail */}
              <div className="aspect-square overflow-hidden">
                <img
                  src={img.url}
                  alt={img.caption ?? ''}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Controls */}
              <div className="p-2.5 flex flex-col gap-2">
                {/* Caption */}
                <input
                  type="text"
                  defaultValue={img.caption ?? ''}
                  placeholder="Надпис (незадължително)"
                  onBlur={e => updateImage(img.id, { caption: e.target.value || null })}
                  className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                />

                <div className="flex items-center gap-2">
                  {/* Position */}
                  <div className="flex items-center gap-1.5 flex-1">
                    <span className="text-muted text-xs">Ред:</span>
                    <input
                      type="number"
                      defaultValue={img.position}
                      onBlur={e => updateImage(img.id, { position: Number(e.target.value) })}
                      className="w-14 bg-background border border-border rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>

                  {/* Published toggle */}
                  <button
                    onClick={() => updateImage(img.id, { published: !img.published })}
                    className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                      img.published
                        ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25'
                        : 'bg-white/5 text-muted hover:bg-white/10'
                    }`}
                  >
                    {img.published ? 'Публ.' : 'Скрито'}
                  </button>
                </div>

                {/* Delete */}
                <button
                  onClick={() => deleteImage(img.id)}
                  className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Изтрий
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && !uploading && (
        <p className="text-center text-muted py-8 text-sm">Няма качени снимки</p>
      )}
    </div>
  )
}
