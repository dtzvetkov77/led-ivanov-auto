'use client'
import { useState } from 'react'
import Image from 'next/image'

type Props = { images: string[]; name: string }

export default function ProductGallery({ images, name }: Props) {
  const [active, setActive] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-surface-2 rounded-lg flex items-center justify-center text-muted">
        Няма снимка
      </div>
    )
  }

  return (
    <div>
      <div className="relative aspect-square rounded-lg overflow-hidden bg-surface-2 mb-3">
        <Image src={images[active]} alt={name} fill className="object-contain" unoptimized />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Снимка ${i + 1}`}
              className={`relative w-16 h-16 flex-shrink-0 rounded overflow-hidden border-2 transition-colors ${i === active ? 'border-accent' : 'border-border'}`}
            >
              <Image src={img} alt="" fill className="object-cover" unoptimized />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
