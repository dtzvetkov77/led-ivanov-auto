'use client'
import { useState } from 'react'
import type { Product } from '@/lib/types'
import ProductCard from './ProductCard'

const INITIAL = 8

export default function BestsellersGrid({ products }: { products: Product[] }) {
  const [expanded, setExpanded] = useState(false)
  const shown = expanded ? products : products.slice(0, INITIAL)
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {shown.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
      {!expanded && products.length > INITIAL && (
        <div className="text-center mt-8">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-block bg-accent hover:bg-accent/90 text-white px-8 py-3 rounded-lg font-bold transition-colors"
          >
            ВИЖ ОЩЕ ({products.length - INITIAL})
          </button>
        </div>
      )}
    </>
  )
}
