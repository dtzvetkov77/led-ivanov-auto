'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getCart, updateQty, removeFromCart, cartTotal } from '@/lib/cart'
import type { CartItem } from '@/lib/types'

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setItems(getCart())
  }, [])

  const handleQty = (id: string, qty: number) => {
    setItems(updateQty(id, qty))
    window.dispatchEvent(new Event('cart-updated'))
  }

  const handleRemove = (id: string) => {
    setItems(removeFromCart(id))
    window.dispatchEvent(new Event('cart-updated'))
  }

  if (!mounted) return null

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-muted text-lg mb-6">Количката е празна</p>
        <Link href="/products" className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded font-semibold transition-colors">
          Към продуктите
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Количка</h1>
      <div className="space-y-4 mb-8">
        {items.map(item => (
          <div key={item.product_id} className="flex gap-4 bg-surface rounded-lg p-4">
            {item.image && (
              <div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden">
                <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {(() => {
                const [base, variation] = item.name.split(' — ')
                return (
                  <>
                    <Link href={`/products/${item.slug}`} className="font-medium line-clamp-1 hover:text-accent transition-colors block">{base}</Link>
                    {variation && <p className="text-xs text-muted mb-1">{variation}</p>}
                  </>
                )
              })()}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQty(item.product_id, item.qty - 1)}
                    disabled={item.qty <= 1}
                    className="w-8 h-8 rounded bg-border-2 text-sm disabled:opacity-30"
                  >−</button>
                  <span>{item.qty}</span>
                  <button onClick={() => handleQty(item.product_id, item.qty + 1)} className="w-8 h-8 rounded bg-border-2 text-sm">+</button>
                </div>
                <span className="text-accent font-bold">{(item.price * item.qty).toFixed(2)} €</span>
                <button onClick={() => handleRemove(item.product_id)} className="ml-auto text-muted hover:text-red-400 text-sm">Премахни</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-surface rounded-lg p-4 flex items-center justify-between mb-4">
        <span className="text-muted">Общо</span>
        <span className="text-2xl font-black">{cartTotal(items).toFixed(2)} €</span>
      </div>
      <Link href="/checkout" className="block w-full bg-accent hover:bg-accent-hover text-white text-center py-4 rounded font-bold text-lg transition-colors">
        Поръчай
      </Link>
    </div>
  )
}
