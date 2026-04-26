'use client'
import { useState } from 'react'

type Props = { images: string[]; name: string }

export default function ProductGallery({ images, name }: Props) {
  const [active, setActive] = useState(0)

  if (images.length === 0) {
    return (
      <div className="w-full aspect-square bg-surface-2 rounded-xl flex items-center justify-center text-muted text-sm">
        Няма снимка
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 w-full min-w-0">
      {/* Main image — square, contained, no overflow */}
      <div className="w-full aspect-square rounded-xl overflow-hidden bg-surface-2">
        <img
          src={images[active]}
          alt={name}
          className="w-full h-full object-contain block"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Снимка ${i + 1}`}
              className={`w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${i === active ? 'border-accent' : 'border-border hover:border-muted'}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover block" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
