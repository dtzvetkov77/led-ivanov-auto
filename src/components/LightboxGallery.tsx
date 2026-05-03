'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

type GalleryImage = { id: string; url: string; caption?: string | null }

export default function LightboxGallery({ images, alt, cols = 'grid-cols-2 sm:grid-cols-3' }: { images: GalleryImage[]; alt: string; cols?: string }) {
  const [active, setActive] = useState<number | null>(null)

  const close = useCallback(() => setActive(null), [])
  const prev = useCallback(() => setActive(i => (i === null ? null : (i - 1 + images.length) % images.length)), [images.length])
  const next = useCallback(() => setActive(i => (i === null ? null : (i + 1) % images.length)), [images.length])

  useEffect(() => {
    if (active === null) return
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', handle)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handle)
      document.body.style.overflow = ''
    }
  }, [active, close, prev, next])

  return (
    <>
      <div className={`grid ${cols} gap-3`}>
        {images.map((img, i) => (
          <div key={img.id} className="flex flex-col gap-1">
            {img.caption && <p className="text-xs text-muted px-1">{img.caption}</p>}
            <button
              onClick={() => setActive(i)}
              className="relative aspect-square rounded-xl overflow-hidden bg-surface border border-border group cursor-zoom-in focus:outline-none"
            >
              <Image
                src={img.url}
                alt={img.caption ?? alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h6m0 0v6m0-6l-7 7M9 21H3m0 0v-6m0 6l7-7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {active !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={close}
        >
          {/* Close */}
          <button
            onClick={close}
            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
            {active + 1} / {images.length}
          </div>

          {/* Prev */}
          {images.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); prev() }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}

          {/* Image */}
          <div
            className="relative w-full h-full max-w-5xl max-h-[90vh] mx-4 flex items-center justify-center"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={images[active].url}
              alt={images[active].caption ?? alt}
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
            {images[active].caption && (
              <div className="absolute bottom-0 left-0 right-0 text-center text-white/60 text-sm pb-2">
                {images[active].caption}
              </div>
            )}
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); next() }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      )}
    </>
  )
}
