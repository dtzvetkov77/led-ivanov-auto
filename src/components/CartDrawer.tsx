'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getCart, updateQty, removeFromCart, cartTotal } from '@/lib/cart'
import type { CartItem } from '@/lib/types'

type Props = { open: boolean; onClose: () => void }

export default function CartDrawer({ open, onClose }: Props) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    const update = () => setItems(getCart())
    update()
    window.addEventListener('cart-updated', update)
    return () => window.removeEventListener('cart-updated', update)
  }, [])

  const handleQty = (id: string, qty: number) => {
    setItems(updateQty(id, qty))
    window.dispatchEvent(new Event('cart-updated'))
  }

  const handleRemove = (id: string) => {
    setItems(removeFromCart(id))
    window.dispatchEvent(new Event('cart-updated'))
  }

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />}
      <div
        aria-hidden={!open}
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-surface z-50 shadow-2xl flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold text-lg">Количка</h2>
          <button onClick={onClose} className="text-muted hover:text-white" aria-label="Затвори количката">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-muted text-center mt-8">Количката е празна</p>
          ) : (
            items.map(item => (
              <div key={item.product_id} className="flex gap-3">
                {item.image && (
                  <div className="relative w-16 h-16 shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover rounded" unoptimized />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {(() => {
                    const [base, variation] = item.name.split(' — ')
                    return (
                      <>
                        <p className="text-sm font-medium line-clamp-1">{base}</p>
                        {variation && <p className="text-xs text-muted mb-0.5">{variation}</p>}
                      </>
                    )
                  })()}
                  <p className="text-accent font-semibold">{item.price.toFixed(2)} €</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => handleQty(item.product_id, item.qty - 1)}
                      disabled={item.qty <= 1}
                      className="w-6 h-6 rounded bg-border-2 flex items-center justify-center text-sm disabled:opacity-30"
                    >−</button>
                    <span className="text-sm w-4 text-center">{item.qty}</span>
                    <button onClick={() => handleQty(item.product_id, item.qty + 1)} className="w-6 h-6 rounded bg-border-2 flex items-center justify-center text-sm">+</button>
                    <button onClick={() => handleRemove(item.product_id)} className="ml-auto text-muted hover:text-red-400 text-xs">Премахни</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-border">
            <div className="flex justify-between mb-3">
              <span className="text-muted">Общо</span>
              <span className="font-bold text-lg">{cartTotal(items).toFixed(2)} €</span>
            </div>
            <Link href="/checkout" onClick={onClose} className="block w-full bg-accent hover:bg-accent-hover text-white text-center py-3 rounded font-semibold transition-colors">
              Поръчай
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
