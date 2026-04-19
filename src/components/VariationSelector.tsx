'use client'
import { useState, useEffect } from 'react'
import type { ProductAttribute, ProductVariation } from '@/lib/types'

type Props = {
  attributes: ProductAttribute[]
  variations: ProductVariation[]
  basePrice: number
  baseSalePrice: number | null
  onVariationChange?: (variation: ProductVariation | null) => void
}

export default function VariationSelector({
  attributes, variations, basePrice, baseSalePrice, onVariationChange,
}: Props) {
  const variationAttrs = attributes.filter(a => a.variation && a.options.length > 0)
  const [selected, setSelected] = useState<Record<string, string>>({})

  // Find the matching variation for the current selection
  const matchedVariation = (() => {
    if (variationAttrs.length === 0) return null
    if (Object.keys(selected).length !== variationAttrs.length) return null
    return variations.find(v =>
      variationAttrs.every(attr => v.attributes[attr.name] === selected[attr.name])
    ) ?? null
  })()

  useEffect(() => {
    onVariationChange?.(matchedVariation ?? null)
  }, [matchedVariation]) // eslint-disable-line react-hooks/exhaustive-deps

  if (variationAttrs.length === 0) return null

  const displayPrice = matchedVariation
    ? (matchedVariation.sale_price ?? matchedVariation.price)
    : (baseSalePrice ?? basePrice)

  const originalPrice = matchedVariation ? matchedVariation.price : basePrice
  const hasSale = matchedVariation
    ? matchedVariation.sale_price !== null
    : baseSalePrice !== null

  // Check if an option is available given current selections (for other attributes)
  function isAvailable(attrName: string, option: string): boolean {
    const testSelection = { ...selected, [attrName]: option }
    if (Object.keys(testSelection).length < variationAttrs.length) return true
    return variations.some(v =>
      Object.entries(testSelection).every(([k, val]) => v.attributes[k] === val)
    )
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Price display */}
      <div>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-black text-accent">{displayPrice.toFixed(2)} €</span>
          {hasSale && (
            <span className="text-muted line-through text-lg">{originalPrice.toFixed(2)} €</span>
          )}
          {matchedVariation && matchedVariation.sku && (
            <span className="text-xs text-muted ml-auto">SKU: {matchedVariation.sku}</span>
          )}
        </div>
        <p className="text-muted/60 text-sm mt-0.5">≈ {(displayPrice * 1.95583).toFixed(2)} лв.</p>
      </div>

      {/* Attribute selectors */}
      {variationAttrs.map(attr => (
        <div key={attr.name}>
          <p className="text-sm text-muted mb-2">
            <span className="font-medium text-white">{attr.name}</span>
            {selected[attr.name] && (
              <span className="ml-2 text-accent">{selected[attr.name]}</span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {attr.options.map(option => {
              const isSelected = selected[attr.name] === option
              const available = isAvailable(attr.name, option)
              return (
                <button
                  key={option}
                  onClick={() => {
                    setSelected(prev =>
                      prev[attr.name] === option
                        ? { ...prev, [attr.name]: '' }
                        : { ...prev, [attr.name]: option }
                    )
                  }}
                  disabled={!available}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    isSelected
                      ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20'
                      : available
                        ? 'border-border text-muted hover:border-accent hover:text-white bg-surface'
                        : 'border-border/30 text-muted/30 cursor-not-allowed line-through'
                  }`}
                >
                  {option}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Incomplete selection hint */}
      {Object.keys(selected).filter(k => selected[k]).length > 0 &&
        Object.keys(selected).filter(k => selected[k]).length < variationAttrs.length && (
        <p className="text-xs text-muted">
          Изберете {variationAttrs
            .filter(a => !selected[a.name])
            .map(a => a.name.toLowerCase())
            .join(', ')} за да продължите
        </p>
      )}

      {/* No match warning */}
      {Object.keys(selected).filter(k => selected[k]).length === variationAttrs.length && !matchedVariation && (
        <p className="text-xs text-red-400">Тази комбинация не е налична.</p>
      )}
    </div>
  )
}
