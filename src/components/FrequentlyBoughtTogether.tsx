'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { addToCart } from '@/lib/cart'
import { dispatchToast } from '@/lib/toast'
import { createClient } from '@/lib/supabase/client'

// category slug → complementary category slugs
const FBT_MAP: Record<string, string[]> = {
  'led-krushki':          ['avtoaksesoari', 'dnevni-svetlini'],
  'dnevni-svetlini':      ['led-krushki', 'byagashti-migachi'],
  'byagashti-migachi':    ['dnevni-svetlini', 'led-krushki'],
  'led-plafoni-za-nomer': ['avtoaksesoari', 'led-krushki'],
  'avtoaksesoari':        ['led-krushki'],
}

type FBTProduct = { id: string; name: string; slug: string; price: number; sale_price: number | null; images: string[] }
type Props = {
  currentProduct: { id: string; name: string; slug: string; price: number; sale_price: number | null; images: string[] }
  categorySlug: string | undefined
}

export default function FrequentlyBoughtTogether({ currentProduct, categorySlug }: Props) {
  const [companion, setCompanion] = useState<FBTProduct | null>(null)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!categorySlug) return
    const targetSlugs = FBT_MAP[categorySlug]
    if (!targetSlugs?.length) return

    const supabase = createClient()
    supabase
      .from('products')
      .select('id,name,slug,price,sale_price,images,categories!category_id(slug)')
      .eq('published', true)
      .neq('id', currentProduct.id)
      .order('position')
      .limit(20)
      .then(({ data }) => {
        if (!data) return
        const match = (data as unknown as (FBTProduct & { categories: { slug: string } | null })[])
          .find(p => targetSlugs.includes((p.categories as any)?.slug ?? ''))
        if (match) setCompanion(match)
      })
  }, [categorySlug, currentProduct.id])

  if (!companion) return null

  const currentPrice = currentProduct.sale_price ?? currentProduct.price
  const companionPrice = companion.sale_price ?? companion.price
  const bundleTotal = currentPrice + companionPrice

  const handleAddBundle = () => {
    setAdding(true)
    addToCart({ product_id: currentProduct.id, name: currentProduct.name, slug: currentProduct.slug, price: currentPrice, image: currentProduct.images[0] ?? '', category_slug: categorySlug })
    addToCart({ product_id: companion.id, name: companion.name, slug: companion.slug, price: companionPrice, image: companion.images[0] ?? '', category_slug: (companion as any).categories?.slug })
    window.dispatchEvent(new Event('cart-updated'))
    dispatchToast('Комплектът е добавен в количката')
    setAdded(true)
    setAdding(false)
    setTimeout(() => setAdded(false), 2500)
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 my-8">
      <p className="text-xs font-bold uppercase tracking-widest text-muted mb-4">Клиентите купуват и</p>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">

        {/* Current product */}
        <Link href={`/products/${currentProduct.slug}`} className="flex items-center gap-3 flex-1 min-w-0 group">
          <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden border border-border bg-surface-2">
            {currentProduct.images[0] && <img src={currentProduct.images[0]} alt={currentProduct.name} className="w-full h-full object-cover" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium line-clamp-2 group-hover:text-accent transition-colors">{currentProduct.name}</p>
            <p className="text-accent font-bold text-sm mt-0.5">{currentPrice.toFixed(2)} €</p>
          </div>
        </Link>

        <span className="text-2xl font-bold text-muted shrink-0 hidden sm:block">+</span>

        {/* Companion product */}
        <Link href={`/products/${companion.slug}`} className="flex items-center gap-3 flex-1 min-w-0 group">
          <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden border border-accent/30 bg-surface-2">
            {companion.images[0] && <img src={companion.images[0]} alt={companion.name} className="w-full h-full object-cover" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium line-clamp-2 group-hover:text-accent transition-colors">{companion.name}</p>
            <p className="text-accent font-bold text-sm mt-0.5">{companionPrice.toFixed(2)} €</p>
          </div>
        </Link>

        {/* Bundle CTA */}
        <div className="w-full sm:w-auto shrink-0 flex flex-col items-end gap-1.5">
          <p className="text-xs text-muted">Заедно: <span className="text-white font-bold">{bundleTotal.toFixed(2)} €</span></p>
          <button
            onClick={handleAddBundle}
            disabled={adding}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
              added ? 'bg-green-600 text-white' : 'bg-accent hover:bg-accent-hover text-white'
            }`}
          >
            {added ? (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Добавено!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" strokeLinecap="round"/></svg>
                Добави комплекта
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
