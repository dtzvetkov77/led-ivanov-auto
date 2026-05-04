'use client'
import { useRouter } from 'next/navigation'
import { addToCart } from '@/lib/cart'
import { dispatchToast } from '@/lib/toast'
import type { Product } from '@/lib/types'
import { useState } from 'react'

type Props = { product: Product }

export default function ProductCard({ product }: Props) {
  const router = useRouter()
  const image = product.images[0] ?? ''
  const displayPrice = product.sale_price ?? product.price
  const [added, setAdded] = useState(false)

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (added) return
    addToCart({
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      price: displayPrice,
      image,
    })
    window.dispatchEvent(new Event('cart-updated'))
    dispatchToast(`${product.name} е добавен в количката`)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <article
      className="group relative bg-surface rounded-lg overflow-hidden border border-border hover:border-accent transition-colors flex flex-col cursor-pointer"
      onClick={() => router.push(`/products/${product.slug}`)}
    >
      <div className="relative aspect-square bg-surface-2 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <ProductImagePlaceholder name={product.name} />
        )}
        {product.sale_price && (
          <span className="absolute top-2 left-2 bg-accent text-white text-xs px-2 py-0.5 rounded font-semibold z-10">
            Промо
          </span>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-sm font-medium line-clamp-3 flex-1 mb-3">{product.name}</h3>
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-accent font-bold text-base whitespace-nowrap">{displayPrice.toFixed(2)} €</span>
            <span className="text-muted/60 text-xs whitespace-nowrap">{(displayPrice * 1.95583).toFixed(2)} лв.</span>
            {product.sale_price && (
              <>
                <span className="text-muted line-through text-xs whitespace-nowrap">{product.price.toFixed(2)} €</span>
                <span className="text-muted/40 line-through text-xs whitespace-nowrap">{(product.price * 1.95583).toFixed(2)} лв.</span>
              </>
            )}
          </div>
          <button
            onClick={handleAdd}
            className={`relative z-10 flex items-center gap-1.5 text-white text-xs px-3 py-2 rounded-lg transition-all font-semibold ${
              added
                ? 'bg-green-600 scale-95'
                : 'bg-accent hover:bg-accent-hover'
            }`}
            aria-label={`Добави ${product.name} в количка`}
          >
            {added ? (
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0" strokeLinecap="round"/>
                </svg>
                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  )
}

function ProductImagePlaceholder({ name }: { name: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-surface-2 p-4">
      <svg className="w-12 h-12 text-accent/40 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M12 2C8 2 5 5.5 5 9c0 2.5 1.3 4.7 3.3 6L9 17h6l.7-2C17.7 13.7 19 11.5 19 9c0-3.5-3-7-7-7z" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="9" y1="21" x2="15" y2="21" strokeLinecap="round"/>
        <line x1="10" y1="19" x2="14" y2="19" strokeLinecap="round"/>
      </svg>
      <p className="text-muted/50 text-[10px] text-center line-clamp-2 leading-tight">{name}</p>
    </div>
  )
}
