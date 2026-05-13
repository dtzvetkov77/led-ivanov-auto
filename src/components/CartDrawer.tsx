'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getCart, updateQty, removeFromCart, cartTotal, addToCart } from '@/lib/cart'
import { dispatchToast } from '@/lib/toast'
import type { CartItem } from '@/lib/types'

const FREE_SHIPPING = 199

type UP = { id: string; name: string; slug: string; price: number; sale_price: number | null; images: string[] }
type Props = { open: boolean; onClose: () => void }

export default function CartDrawer({ open, onClose }: Props) {
  const [items, setItems] = useState<CartItem[]>([])
  const [upsell, setUpsell] = useState<UP[]>([])

  useEffect(() => {
    const update = () => setItems(getCart())
    update()
    window.addEventListener('cart-updated', update)
    return () => window.removeEventListener('cart-updated', update)
  }, [])

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
        setUpsell((data as UP[]).filter(p => !cartIds.has(p.id)).slice(0, 3))
      })
  }, [open])

  // Lock body scroll when open (iOS Safari fix)
  useEffect(() => {
    if (!open) return
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, scrollY)
    }
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
    addToCart({ product_id: p.id, name: p.name, slug: p.slug, price: p.sale_price ?? p.price, image: p.images[0] ?? '' })
    window.dispatchEvent(new Event('cart-updated'))
    dispatchToast(`${p.name} е добавен в количката`)
    setUpsell(prev => prev.filter(u => u.id !== p.id))
    setItems(getCart())
  }

  const total = cartTotal(items)
  const remaining = Math.max(0, FREE_SHIPPING - total)
  const progress = Math.min(100, (total / FREE_SHIPPING) * 100)
  const freeShipping = total >= FREE_SHIPPING

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/70 z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        aria-hidden={!open}
        className={`fixed top-0 right-0 h-dvh w-full max-w-100 bg-[#111] z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0" strokeLinecap="round"/>
            </svg>
            <h2 className="font-bold text-base">Количка</h2>
            {items.length > 0 && (
              <span className="bg-accent text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">{items.reduce((s, i) => s + i.qty, 0)}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-border hover:bg-border-2 text-muted hover:text-white flex items-center justify-center transition-colors"
            aria-label="Затвори"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Free shipping progress */}
        {items.length > 0 && (
          <div className="px-5 py-3 border-b border-border shrink-0">
            {freeShipping ? (
              <div className="flex items-center gap-2 text-green-400 text-xs font-semibold">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Безплатна доставка!
              </div>
            ) : (
              <p className="text-xs text-muted">
                Още <span className="text-white font-semibold">{remaining.toFixed(2)} €</span> за безплатна доставка
              </p>
            )}
            <div className="h-1 bg-border rounded-full overflow-hidden mt-2">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: freeShipping ? '#22c55e' : 'var(--color-accent)' }}
              />
            </div>
          </div>
        )}

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted px-6">
              <svg className="w-14 h-14 text-border" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0" strokeLinecap="round"/>
              </svg>
              <p className="text-sm text-center">Количката е празна</p>
              <Link
                href="/products"
                onClick={onClose}
                className="text-xs text-accent hover:underline"
              >
                Разгледай продукти →
              </Link>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {/* Cart items */}
              {items.map(item => {
                const [base, variation] = item.name.split(' — ')
                return (
                  <div key={item.product_id} className="flex gap-3 bg-background border border-border rounded-xl p-3">
                    {item.image ? (
                      <div className="w-18 h-18 shrink-0 rounded-lg overflow-hidden bg-surface-2">
                        <img src={item.image} alt={base} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-18 h-18 shrink-0 rounded-lg bg-surface-2 flex items-center justify-center">
                        <svg className="w-6 h-6 text-muted/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                        </svg>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-snug line-clamp-2">{base}</p>
                      {variation && (
                        <p className="text-xs text-accent/80 mt-0.5">{variation}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <span className="text-accent font-bold text-sm">{item.price.toFixed(2)} €</span>
                          <span className="text-muted/50 text-[11px] ml-1.5">{(item.price * 1.95583).toFixed(2)} лв.</span>
                        </div>
                        <button
                          onClick={() => handleRemove(item.product_id)}
                          className="text-muted/40 hover:text-red-400 transition-colors"
                          aria-label="Премахни"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>

                      {/* Qty controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleQty(item.product_id, item.qty - 1)}
                          disabled={item.qty <= 1}
                          className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center text-sm font-bold disabled:opacity-30 hover:border-accent/50 transition-colors"
                        >
                          −
                        </button>
                        <span className="text-sm font-semibold w-5 text-center">{item.qty}</span>
                        <button
                          onClick={() => handleQty(item.product_id, item.qty + 1)}
                          className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center text-sm font-bold hover:border-accent/50 transition-colors"
                        >
                          +
                        </button>
                        <span className="text-xs text-muted ml-1">= {(item.price * item.qty).toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Upsell */}
              {upsell.length > 0 && (
                <div className="pt-1">
                  <p className="text-[11px] text-muted uppercase tracking-widest font-semibold mb-2.5 px-1">Добавете също</p>
                  <div className="space-y-2">
                    {upsell.map(p => (
                      <div key={p.id} className="flex items-center gap-3 bg-background border border-border rounded-xl p-2.5 hover:border-accent/40 transition-colors">
                        {p.images[0] && (
                          <div className="w-11 h-11 shrink-0 rounded-lg overflow-hidden bg-surface-2">
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium line-clamp-1 leading-tight">{p.name}</p>
                          <p className="text-accent text-xs font-bold mt-0.5">{(p.sale_price ?? p.price).toFixed(2)} €</p>
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
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-border shrink-0 bg-[#111]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-muted text-sm">Общо</span>
              <div className="text-right">
                <div className="font-black text-xl">{total.toFixed(2)} €</div>
                <div className="text-muted text-xs">≈ {(total * 1.95583).toFixed(2)} лв.</div>
              </div>
            </div>
            <Link
              href="/checkout"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full bg-accent hover:bg-accent-hover text-white font-bold py-3.5 rounded-xl transition-colors text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Поръчай — {total.toFixed(2)} €
            </Link>
            <p className="text-center text-xs text-muted mt-2.5">Плащане с наложен платеж</p>
          </div>
        )}
      </div>
    </>
  )
}
