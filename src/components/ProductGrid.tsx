import type { Product } from '@/lib/types'
import ProductCard from './ProductCard'

type Props = { products: Product[] }

// ProductCard is a client component, so every prop ends up in the HTML payload.
// Send only what the card uses: no descriptions, first image only, one variation stub.
function slim(p: Product): Product {
  return {
    ...p,
    description: null,
    short_description: null,
    images: (p.images ?? []).slice(0, 1),
    variations: p.variations && p.variations.length > 0
      ? [{ ...p.variations[0], images: [] }]
      : [],
  }
}

export default function ProductGrid({ products }: Props) {
  if (products.length === 0) {
    return <p className="text-muted text-center py-12">Няма намерени продукти.</p>
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p, i) => <ProductCard key={p.id} product={slim(p)} priority={i < 4} />)}
    </div>
  )
}
