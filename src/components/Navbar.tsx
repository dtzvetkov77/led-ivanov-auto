'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { getCart } from '@/lib/cart'
import CartDrawer from './CartDrawer'
import { PRODUCT_CATEGORIES } from '@/lib/categories'
import LogoImage from './LogoImage'

export default function Navbar() {
  const [cartCount, setCartCount] = useState<number | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [productsOpen, setProductsOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const update = () => {
      const items = getCart()
      setCartCount(items.reduce((s, i) => s + i.qty, 0))
    }
    update()
    window.addEventListener('cart-updated', update)
    return () => window.removeEventListener('cart-updated', update)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProductsOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const navLinks = [
    { href: '/about',   label: 'За нас' },
    { href: '/gallery', label: 'Галерия' },
    { href: '/contact', label: 'Контакти' },
  ]

  return (
    <>
      <nav className="fixed top-8 left-0 right-0 z-40 bg-background/92 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between md:grid md:grid-cols-3">

          {/* Logo – left column */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center shrink-0" onClick={() => setMobileOpen(false)}>
              <LogoImage className="h-8 max-w-48 md:max-w-54" />
            </Link>
          </div>

          {/* Desktop links – center column */}
          <div className="hidden md:flex items-center justify-center gap-1 text-sm">

            {/* Продукти dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProductsOpen(v => !v)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${productsOpen ? 'text-white bg-surface' : 'text-muted hover:text-white hover:bg-surface'}`}
              >
                Продукти
                <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${productsOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {productsOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-surface border border-border rounded-xl shadow-xl shadow-black/40 min-w-56 py-1 z-50">
                  <Link
                    href="/products"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted hover:text-white hover:bg-border transition-colors"
                    onClick={() => setProductsOpen(false)}
                  >
                    <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                    </svg>
                    Всички продукти
                  </Link>
                  <div className="h-px bg-border mx-3 my-1" />
                  {PRODUCT_CATEGORIES.map(cat => (
                    <Link
                      key={cat.slug}
                      href={`/products?category=${cat.slug}`}
                      className="block px-4 py-2 text-sm text-muted hover:text-white hover:bg-border transition-colors"
                      onClick={() => setProductsOpen(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navLinks.map(l => (
              <Link key={l.href} href={l.href}
                className="px-3 py-2 rounded-lg text-muted hover:text-white hover:bg-surface transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right actions – right column */}
          <div className="flex items-center justify-end gap-1">
            {/* Cart */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="relative p-2 text-muted hover:text-white transition-colors rounded-lg hover:bg-surface"
              aria-label="Количка"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0" strokeLinecap="round"/>
              </svg>
              {cartCount !== null && cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center leading-none">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden p-2 text-muted hover:text-white transition-colors rounded-lg hover:bg-surface"
              aria-label="Меню"
            >
              {mobileOpen ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-surface pb-4 px-4">
            <div className="pt-3 space-y-1">
              <p className="text-xs text-muted uppercase tracking-widest px-3 py-2">Продукти</p>
              <Link href="/products" className="block px-3 py-2 text-sm text-muted hover:text-white hover:bg-border rounded-lg transition-colors"
                onClick={() => setMobileOpen(false)}>
                Всички продукти
              </Link>
              {PRODUCT_CATEGORIES.map(cat => (
                <Link key={cat.slug} href={`/products?category=${cat.slug}`}
                  className="block px-3 py-2 text-sm text-muted hover:text-white hover:bg-border rounded-lg transition-colors pl-5"
                  onClick={() => setMobileOpen(false)}>
                  {cat.name}
                </Link>
              ))}
              <div className="h-px bg-border mx-3 my-2" />
              {navLinks.map(l => (
                <Link key={l.href} href={l.href}
                  className="block px-3 py-2 text-sm text-muted hover:text-white hover:bg-border rounded-lg transition-colors"
                  onClick={() => setMobileOpen(false)}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
