'use client'
import { useState } from 'react'
import { addToCart } from '@/lib/cart'
import { dispatchToast } from '@/lib/toast'
import VariationSelector from './VariationSelector'
import type { Product, ProductVariation } from '@/lib/types'

type Props = { product: Product }

export default function ProductActions({ product }: Props) {
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null)
  const [added, setAdded] = useState(false)

  const hasVariations = product.variations && product.variations.length > 0
  const variationAttrs = product.attributes?.filter(a => a.variation && a.options.length > 0) ?? []

  // Determine effective price
  const effectivePrice = selectedVariation
    ? (selectedVariation.sale_price ?? selectedVariation.price)
    : (product.sale_price ?? product.price)

  const canAddToCart = !hasVariations || variationAttrs.length === 0 || selectedVariation !== null

  const handleAddToCart = () => {
    const name = selectedVariation
      ? `${product.name} — ${Object.entries(selectedVariation.attributes).map(([k, v]) => `${k}: ${v}`).join(', ')}`
      : product.name
    const image = (selectedVariation?.images?.[0]) ?? product.images[0] ?? ''

    addToCart({
      product_id: selectedVariation
        ? `${product.id}__${JSON.stringify(selectedVariation.attributes)}`
        : product.id,
      name,
      slug: product.slug,
      price: Number(effectivePrice),
      image,
    })
    window.dispatchEvent(new Event('cart-updated'))
    dispatchToast(`${product.name} е добавен в количката`)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <>
      {hasVariations ? (
        <VariationSelector
          attributes={product.attributes ?? []}
          variations={product.variations ?? []}
          basePrice={product.price}
          baseSalePrice={product.sale_price}
          onVariationChange={setSelectedVariation}
        />
      ) : (
        /* Price display for simple products */
        <div className="mb-6">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-accent">
              {Number(effectivePrice).toFixed(2)} €
            </span>
            {product.sale_price && (
              <span className="text-muted line-through text-lg">
                {Number(product.price).toFixed(2)} €
              </span>
            )}
          </div>
          <p className="text-muted/60 text-sm mt-0.5">≈ {(Number(effectivePrice) * 1.95583).toFixed(2)} лв.</p>
        </div>
      )}

      <button
        onClick={handleAddToCart}
        disabled={!canAddToCart}
        className={`w-full flex items-center justify-center gap-3 font-bold py-4 rounded-xl text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
          added
            ? 'bg-green-600 text-white scale-[0.98]'
            : 'bg-accent hover:bg-accent-hover text-white'
        }`}
      >
        {added ? (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Добавено в количката!
          </>
        ) : !canAddToCart ? (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0" strokeLinecap="round"/>
            </svg>
            Изберете вариация
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0" strokeLinecap="round"/>
            </svg>
            <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
            </svg>
            Добави в количката
          </>
        )}
      </button>
    </>
  )
}
