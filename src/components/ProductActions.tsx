'use client'
import { useState, useRef, useEffect } from 'react'
import { addToCart } from '@/lib/cart'
import { dispatchToast } from '@/lib/toast'
import VariationSelector from './VariationSelector'
import type { Product, ProductVariation } from '@/lib/types'

type Props = { product: Product; categorySlug?: string }

export default function ProductActions({ product, categorySlug }: Props) {
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null)
  const [added, setAdded] = useState(false)
  const [showStickyBar, setShowStickyBar] = useState(false)
  const atcRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const el = atcRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const hasVariations = product.variations && product.variations.length > 0
  const variationAttrs = product.attributes?.filter(a => a.variation && a.options.length > 0) ?? []

  // Determine effective price
  const effectivePrice = selectedVariation
    ? (selectedVariation.sale_price ?? selectedVariation.price)
    : (product.sale_price ?? product.price)

  const simpleOutOfStock = !hasVariations && product.stock_quantity === 0
  const variationOutOfStock = selectedVariation !== null && selectedVariation.stock_quantity === 0
  const isOutOfStock = simpleOutOfStock || variationOutOfStock

  const canAddToCart = !isOutOfStock && (!hasVariations || variationAttrs.length === 0 || selectedVariation !== null)

  // Effective stock for urgency badge
  const effectiveStock = selectedVariation !== null
    ? selectedVariation.stock_quantity
    : (!hasVariations ? product.stock_quantity : null)
  const showUrgency = effectiveStock !== null && effectiveStock > 0 && effectiveStock <= 5

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
      category_slug: categorySlug,
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
            <span className="text-3xl font-medium text-accent">
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

      {showUrgency && (
        <p className="flex items-center gap-1.5 text-red-400 text-sm font-semibold mb-3">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Остават само {effectiveStock} бр.!
        </p>
      )}

      <button
        ref={atcRef}
        onClick={handleAddToCart}
        disabled={!canAddToCart}
        className={`w-full flex items-center justify-center gap-3 font-bold py-4 rounded-xl text-base transition-all duration-200 disabled:cursor-not-allowed ${
          added
            ? 'bg-green-600 text-white scale-[0.98]'
            : isOutOfStock
              ? 'bg-surface border border-border text-muted cursor-not-allowed'
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
        ) : isOutOfStock ? (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" strokeLinecap="round"/>
            </svg>
            Изчерпан
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

      {/* Sticky ATC bar — visible when main button scrolled out of view */}
      {showStickyBar && canAddToCart && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border px-4 py-3 flex items-center gap-3 shadow-lg">
          {product.images[0] && (
            <img src={product.images[0]} alt={product.name} className="w-10 h-10 rounded-lg object-cover shrink-0 border border-border" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold line-clamp-1">{product.name}</p>
            {selectedVariation && (
              <p className="text-[11px] text-muted line-clamp-1">
                {Object.entries(selectedVariation.attributes).map(([,v]) => v).join(' · ')}
              </p>
            )}
          </div>
          <div className="shrink-0 text-right mr-1">
            <p className="text-accent font-bold text-sm">{Number(effectivePrice).toFixed(2)} €</p>
          </div>
          <button
            onClick={handleAddToCart}
            className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
              added ? 'bg-green-600 text-white' : 'bg-accent hover:bg-accent-hover text-white'
            }`}
          >
            {added ? 'Добавено ✓' : 'Добави'}
          </button>
        </div>
      )}
    </>
  )
}
