import type { CartItem } from './types'

const KEY = 'led_ivanov_cart_id'

/** Stable per-cart id so repeated captures update one abandoned_carts row. */
export function getCartId(): string {
  try {
    let id = localStorage.getItem(KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(KEY, id)
    }
    return id
  } catch {
    return crypto.randomUUID()
  }
}

export function setCartId(id: string) {
  try { localStorage.setItem(KEY, id) } catch {}
}

/** New id after an order so the next cart is tracked separately. */
export function resetCartId() {
  try { localStorage.removeItem(KEY) } catch {}
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function captureCart(email: string, items: CartItem[]) {
  if (!EMAIL.test(email.trim()) || !items.length) return
  fetch('/api/cart-capture', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: getCartId(),
      email: email.trim(),
      items: items.map(i => ({ product_id: i.product_id, qty: i.qty })),
    }),
    keepalive: true,
  }).catch(() => {})
}
