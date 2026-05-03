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
  const [isMobile, setIsMobile] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

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

  // Close on outside click — desktop only
  useEffect(() => {
    if (isMobile) return
    const handle = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) closeSearch()
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [closeSearch, isMobile])

  // Lock body scroll when mobile overlay open
  useEffect(() => {
    document.body.style.overflow = (isMobile && open) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isMobile, open])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 2) { setResults([]); setLoading(false); setActive(-1); return }
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
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, -1)) }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (active >= 0 && results[active]) { navigateTo(`/products/${results[active].slug}`) }
      else submitSearch()
    }
  }

  const navigateTo = (href: string) => {
    // Blur input first so iOS keyboard dismisses and restores viewport before navigation
    inputRef.current?.blur()
    setTimeout(() => {
      closeSearch()
      router.push(href)
    }, 100)
  }

  const submitSearch = () => {
    const q = query.trim()
    if (!q) return
    navigateTo(`/products?q=${encodeURIComponent(q)}`)
  }

  const showResults = open && (loading || results.length > 0 || query.trim().length >= 2)

  const ResultsList = () => (
    <>
      {loading && (
        <div className="flex items-center gap-2 px-5 py-4 text-muted text-xs">
          <svg className="w-4 h-4 animate-spin shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
          Търсене...
        </div>
      )}
      {!loading && results.length === 0 && query.trim().length >= 2 && (
        <p className="px-5 py-6 text-center text-muted text-xs">Няма резултати за „{query.trim()}"</p>
      )}
      {!loading && results.length > 0 && (
        <>
          <ul>
            {results.map((hit, i) => {
              const price = hit.sale_price ?? hit.price
              return (
                <li key={hit.id}>
                  <Link
                    href={`/products/${hit.slug}`}
                    onClick={e => { e.preventDefault(); navigateTo(`/products/${hit.slug}`) }}
                    onMouseEnter={() => setActive(i)}
                    className={`flex items-center gap-3 px-5 py-3 transition-colors ${i === active ? 'bg-accent/10' : 'hover:bg-border'}`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-background border border-border overflow-hidden shrink-0">
                      {hit.images?.[0] ? (
                        <img src={hit.images[0]} alt={hit.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted/30">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium line-clamp-2 text-white leading-snug">{hit.name}</p>
                      <p className="text-xs text-accent font-bold mt-0.5">
                        {price.toFixed(2)} €
                        <span className="text-muted font-normal ml-1">/ {(price * 1.95583).toFixed(2)} лв.</span>
                        {hit.sale_price && <span className="text-muted line-through ml-2 font-normal">{hit.price.toFixed(2)} €</span>}
                      </p>
                    </div>
                    <svg className="w-3 h-3 shrink-0 text-muted/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                </li>
              )
            })}
          </ul>
          <div className="border-t border-border">
            <button onClick={submitSearch}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 text-xs text-accent hover:bg-accent/10 transition-colors font-semibold">
              Виж всички за „{query.trim()}"
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </>
      )}
    </>
  )

  // ── Mobile: right-side drawer (70% width) ────────────────────────────
  if (isMobile) {
    return (
      <>
        <button type="button" onClick={openSearch}
          className="p-2 text-muted hover:text-white transition-colors rounded-lg hover:bg-surface" aria-label="Търсене">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Backdrop */}
        <div
          className={`fixed inset-0 z-[59] bg-black/60 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={closeSearch}
        />

        {/* Drawer */}
        <div
          className={`fixed right-0 top-0 z-60 flex flex-col bg-background border-l border-border transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ width: '70vw', height: '100dvh' }}
        >
          {/* Header bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface shrink-0">
            <svg className="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Търси..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-muted/60 focus:outline-none min-w-0"
            />
            <button type="button" onClick={query ? () => setQuery('') : closeSearch}
              className="p-1 text-muted hover:text-white rounded-lg hover:bg-border transition-colors shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto">
            {showResults ? <ResultsList /> : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-muted/30 px-6 text-center">
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
                </svg>
                <p className="text-xs">Напиши поне 2 символа</p>
              </div>
            )}
          </div>
        </div>
      </>
    )
  }

  // ── Desktop: inline expand + dropdown ────────────────────────────────
  return (
    <div ref={containerRef} className="relative">
      {open ? (
        <div className="flex items-center gap-1">
          <input ref={inputRef} type="text" value={query}
            onChange={e => setQuery(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Търси продукт..."
            className="w-44 sm:w-60 bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent transition-all"
          />
          <button type="button" onClick={submitSearch}
            className="p-2 text-muted hover:text-white transition-colors rounded-lg hover:bg-surface" aria-label="Търси">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
            </svg>
          </button>
          <button type="button" onClick={closeSearch}
            className="p-2 text-muted hover:text-white transition-colors rounded-lg hover:bg-surface" aria-label="Затвори">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      ) : (
        <button type="button" onClick={openSearch}
          className="p-2 text-muted hover:text-white transition-colors rounded-lg hover:bg-surface" aria-label="Търсене">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
          </svg>
        </button>
      )}

      {showResults && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-surface border border-border rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50">
          <ResultsList />
        </div>
      )}
    </div>
  )
}
