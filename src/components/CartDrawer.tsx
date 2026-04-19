'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getCart, updateQty, removeFromCart, cartTotal, addToCart } from '@/lib/cart'
import { dispatchToast } from '@/lib/toast'
import type { CartItem } from '@/lib/types'

const FREE_SHIPPING = 150

type UP = { id: string; name: string; slug: string; price: number; sale_price: number | null; images: string[] }
type Props = { open: boolean; onClose: () => void }

export default function CartDrawer({ open, onClose }: Props) {
  const [items, setItems]         = useState<CartItem[]>([])
  const [upsell, setUpsell]       = useState<UP[]>([])

  useEffect(() => {
    const update = () => setItems(getCart())
    update()
    window.addEventListener('cart-updated', update)
    return () => window.removeEventListener('cart-updated', update)
  }, [])

  // Fetch upsell products once on open
  useEffect(() => {
    if (!open) return
    const supabase = createClient()
    supabase
      .from('products')
      .select('id,name,slug,price,sale_price,images')
      .eq('published', true)
      .order('position')
      .limit(12)
      .then(({ data }) => {
        if (!data) return
        const cartIds = new Set(getCart().map(i => i.product_id))
        const filtered = (data as UP[]).filter(p => !cartIds.has(p.id))
        setUpsell(filtered.slice(0, 3))
      })
  }, [open])

  const handleQty = (id: string, qty: number) => {
    setItems(updateQty(id, qty))
    window.dispatchEvent(new Event('cart-updated'))
  }

  const handleRemove = (id: string) => {
    setItems(removeFromCart(id))
    window.dispatchEvent(new Event('cart-updated'))
  }

  const handleAddUpsell = (p: UP) => {
    addToCart({
      product_id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.sale_price ?? p.price,
      image: p.images[0] ?? '',
    })
    window.dispatchEvent(new Event('cart-updated'))
    dispatchToast(`${p.name} е добавен в количката`)
    setUpsell(prev => prev.filter(u => u.id !== p.id))
    setItems(getCart())
  }

  const total       = cartTotal(items)
  const remaining   = Math.max(0, FREE_SHIPPING - total)
  const progress    = Math.min(100, (total / FREE_SHIPPING) * 100)
  const freeShipping = total >= FREE_SHIPPING

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />}
      <div
        aria-hidden={!open}
        className={`fixed top-0 right-0 h-dvh w-full max-w-sm bg-surface z-50 shadow-2xl flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <h2 className="font-semibold text-lg">Количка</h2>
          <button onClick={onClose} className="text-muted hover:text-white" aria-label="Затвори количката">✕</button>
        </div>

        {/* Free shipping bar */}
        {items.length > 0 && (
          <div className="px-4 pt-3 pb-2 border-b border-border shrink-0">
            {freeShipping ? (
              <div className="flex items-center gap-2 text-green-400 text-xs font-semibold">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Безплатна доставка!
              </div>
            ) : (
              <p className="text-xs text-muted mb-1.5">
                Добави само <span className="text-white font-semibold">{remaining.toFixed(2)} €</span> за безплатна доставка
              </p>
            )}
            <div className="h-1.5 bg-border rounded-full overflow-hidden mt-1">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: freeShipping ? '#22c55e' : 'var(--color-accent)' }}
              />
            </div>
          </div>
        )}

        {/* Items */}
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
                  <p className="text-accent font-semibold whitespace-nowrap">{item.price.toFixed(2)} €</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button onClick={() => handleQty(item.product_id, item.qty - 1)} disabled={item.qty <= 1}
                      className="w-6 h-6 rounded bg-border-2 flex items-center justify-center text-sm disabled:opacity-30">−</button>
                    <span className="text-sm w-4 text-center">{item.qty}</span>
                    <button onClick={() => handleQty(item.product_id, item.qty + 1)}
                      className="w-6 h-6 rounded bg-border-2 flex items-center justify-center text-sm">+</button>
                    <button onClick={() => handleRemove(item.product_id)} className="ml-auto text-muted hover:text-red-400 text-xs">Премахни</button>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Upsell */}
          {upsell.length > 0 && items.length > 0 && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted uppercase tracking-widest font-semibold mb-3">Добавете също</p>
              <div className="space-y-2">
                {upsell.map(p => (
                  <div key={p.id} className="flex items-center gap-3 bg-background border border-border rounded-xl p-2.5 hover:border-accent/50 transition-colors">
                    {p.images[0] && (
                      <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-surface-2">
                        <Image src={p.images[0]} alt={p.name} fill className="object-cover" unoptimized />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium line-clamp-2 leading-tight">{p.name}</p>
                      <p className="text-accent text-xs font-bold mt-0.5 whitespace-nowrap">
                        {(p.sale_price ?? p.price).toFixed(2)} €
                      </p>
                    </div>
                    <button
                      onClick={() => handleAddUpsell(p)}
                      className="shrink-0 w-8 h-8 rounded-lg bg-accent hover:bg-accent-hover text-white flex items-center justify-center transition-colors"
                      aria-label={`Добави ${p.name}`}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-border shrink-0">
            <div className="flex justify-between items-start mb-3">
              <span className="text-muted">Общо</span>
              <div className="flex flex-col items-end">
                <span className="font-bold text-lg whitespace-nowrap">{total.toFixed(2)} €</span>
                <span className="text-muted text-xs">≈ {(total * 1.95583).toFixed(2)} лв.</span>
              </div>
            </div>
            <Link href="/checkout" onClick={onClose}
              className="block w-full bg-accent hover:bg-accent-hover text-white text-center py-3 rounded font-semibold transition-colors">
              Поръчай
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
