import type { Product } from '@/lib/types'
import ProductCard from './ProductCard'

type Props = { products: Product[] }

export default function ProductGrid({ products }: Props) {
  if (products.length === 0) {
    return <p className="text-muted text-center py-12">Няма намерени продукти.</p>
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}
