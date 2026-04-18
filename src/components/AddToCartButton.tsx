'use client'
import { addToCart } from '@/lib/cart'
import type { Product } from '@/lib/types'
import { useState } from 'react'

type Props = { product: Product }

export default function AddToCartButton({ product }: Props) {
  const [added, setAdded] = useState(false)
  const displayPrice = product.sale_price ?? product.price

  const handleClick = () => {
    addToCart({
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(displayPrice),
      image: product.images[0] ?? '',
    })
    window.dispatchEvent(new Event('cart-updated'))
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <button
      onClick={handleClick}
      className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-4 rounded text-lg transition-colors"
    >
      {added ? 'Добавено ✓' : 'Добави в количка'}
    </button>
  )
}
