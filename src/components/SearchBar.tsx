'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Hit = {
  id: string
  slug: string
  name: string
  price: number
  sale_price: number | null
  images: string[]
}

export default function SearchBar() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Hit[]>([])
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openSearch = () => {
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const closeSearch = useCallback(() => {
    setOpen(false)
    setQuery('')
    setResults([])
    setActive(-1)
  }, [])

  // Close on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeSearch()
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [closeSearch])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 2) {
      setResults([])
      setLoading(false)
      setActive(-1)
      return
    }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('id, slug, name, price, sale_price, images')
        .eq('published', true)
        .ilike('name', `%${query.trim()}%`)
        .order('position')
        .limit(6)
      setResults((data ?? []) as Hit[])
      setLoading(false)
      setActive(-1)
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') { closeSearch(); return }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive(a => Math.min(a + 1, results.length - 1))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive(a => Math.max(a - 1, -1))
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (active >= 0 && results[active]) {
        router.push(`/products/${results[active].slug}`)
        closeSearch()
      } else {
        submitSearch()
      }
    }
  }

  const submitSearch = () => {
    const q = query.trim()
    if (!q) return
    router.push(`/products?q=${encodeURIComponent(q)}`)
    closeSearch()
  }

  const showDropdown = open && (loading || results.length > 0 || query.trim().length >= 2)

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger / input */}
      {open ? (
        <div className="flex items-center gap-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Търси продукт..."
            className="w-44 sm:w-60 bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent transition-all"
          />
          <button
            type="button"
            onClick={submitSearch}
            className="p-2 text-muted hover:text-white transition-colors rounded-lg hover:bg-surface"
            aria-label="Търси"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={closeSearch}
            className="p-2 text-muted hover:text-white transition-colors rounded-lg hover:bg-surface"
            aria-label="Затвори"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={openSearch}
          className="p-2 text-muted hover:text-white transition-colors rounded-lg hover:bg-surface"
          aria-label="Търсене"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
          </svg>
        </button>
      )}

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-surface border border-border rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50">
          {loading && (
            <div className="flex items-center gap-3 px-4 py-3 text-muted text-sm">
              <svg className="w-4 h-4 animate-spin shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              Търсене...
            </div>
          )}

          {!loading && results.length === 0 && query.trim().length >= 2 && (
            <div className="px-4 py-6 text-center text-muted text-sm">
              Няма намерени продукти за „{query.trim()}"
            </div>
          )}

          {!loading && results.length > 0 && (
            <>
              <ul>
                {results.map((hit, i) => {
                  const displayPrice = hit.sale_price ?? hit.price
                  const img = hit.images?.[0]
                  return (
                    <li key={hit.id}>
                      <Link
                        href={`/products/${hit.slug}`}
                        onClick={closeSearch}
                        className={`flex items-center gap-3 px-4 py-3 transition-colors ${i === active ? 'bg-accent/10 text-white' : 'hover:bg-border text-muted hover:text-white'}`}
                        onMouseEnter={() => setActive(i)}
                      >
                        <div className="w-10 h-10 rounded-lg bg-background border border-border overflow-hidden shrink-0">
                          {img ? (
                            <img src={img} alt={hit.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted/30">
                              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-white">{hit.name}</p>
                          <p className="text-xs text-accent font-bold mt-0.5">
                            {displayPrice.toFixed(2)} лв.
                            {hit.sale_price && (
                              <span className="text-muted line-through ml-2 font-normal">{hit.price.toFixed(2)} лв.</span>
                            )}
                          </p>
                        </div>
                        <svg className="w-3.5 h-3.5 shrink-0 text-muted/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Link>
                    </li>
                  )
                })}
              </ul>
              <div className="border-t border-border">
                <button
                  onClick={submitSearch}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs text-accent hover:bg-accent/10 transition-colors font-semibold"
                >
                  Виж всички резултати за „{query.trim()}"
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
