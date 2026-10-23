import type { CartItem } from './types'
import { CONVERSIONS, trackConversion, trackGa4 } from './gtag'

const KEY = 'led_ivanov_cart'

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(items))
}

export function addToCart(item: Omit<CartItem, 'qty'>): CartItem[] {
  const cart = getCart()
  const existing = cart.find(i => i.product_id === item.product_id)
  if (existing) {
    existing.qty += 1
  } else {
    cart.push({ ...item, qty: 1 })
  }
  saveCart(cart)
  trackConversion(CONVERSIONS.addToCart, { value: item.price, currency: 'EUR' })
  trackGa4('add_to_cart', [{ ...item, qty: 1 }])
  return cart
}

export function updateQty(product_id: string, qty: number): CartItem[] {
  const cart = getCart().map(i =>
    i.product_id === product_id ? { ...i, qty } : i
  ).filter(i => i.qty > 0)
  saveCart(cart)
  return cart
}

export function removeFromCart(product_id: string): CartItem[] {
  const cart = getCart().filter(i => i.product_id !== product_id)
  saveCart(cart)
  return cart
}

export function clearCart(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEY)
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0)
}
