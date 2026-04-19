'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PRODUCT_CATEGORIES } from '@/lib/categories'

type Make  = { id: string; name: string; slug: string }
type Model = { id: string; name: string }
type StaticCategory = { slug: string; name: string }

// ── Shared dropdown UI ───────────────────────────────────────────────────────
function DropdownButton({
  label, selected, loading, disabled, open, onToggle,
}: {
  label: string
  selected?: string
  loading?: boolean
  disabled?: boolean
  open: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled || loading}
      className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-sm text-left transition-all duration-150 ${
        disabled || loading
          ? 'bg-surface/50 border-border text-muted/40 cursor-not-allowed'
          : open
            ? 'bg-surface border-accent text-white shadow-lg shadow-accent/10'
            : selected
              ? 'bg-surface border-accent/50 text-white hover:border-accent/80'
              : 'bg-surface border-border text-muted hover:border-border-2 hover:text-white/80'
      }`}
    >
      <span className="truncate">{loading ? 'Зарежда…' : (selected ?? label)}</span>
      {loading ? (
        <svg className="w-4 h-4 shrink-0 text-muted animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
        </svg>
      ) : (
        <svg className={`w-4 h-4 shrink-0 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  )
}

function ClearRow({ onClear }: { onClear: () => void }) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-accent hover:bg-border transition-colors border-b border-border"
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
      </svg>
      Изчисти
    </button>
  )
}

// ── Select for dynamic data (id-keyed) ───────────────────────────────────────
function DynSelect<T extends { id: string; name: string }>({
  placeholder, options, value, onChange, disabled, loading, emptyHint,
}: {
  placeholder: string
  options: T[]
  value: T | null
  onChange: (v: T | null) => void
  disabled?: boolean
  loading?: boolean
  emptyHint?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const isDisabled = !!(disabled || loading)

  return (
    <div ref={ref} className="relative w-full">
      <DropdownButton
        label={placeholder}
        selected={value?.name}
        loading={loading}
        disabled={isDisabled}
        open={open}
        onToggle={() => !isDisabled && setOpen(v => !v)}
      />

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface-2 border border-border rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden">
          {value && <ClearRow onClear={() => { onChange(null); setOpen(false) }} />}

          {options.length === 0 ? (
            <p className="px-4 py-3 text-xs text-muted/60 italic">
              {emptyHint ?? 'Няма намерени записи'}
            </p>
          ) : (
            <div className="max-h-52 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cc0000 #1a1a1a' }}>
              {options.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => { onChange(opt); setOpen(false) }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-border ${
                    value?.id === opt.id ? 'text-accent bg-accent/10' : 'text-muted-2 hover:text-white'
                  }`}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Select for static categories (slug-keyed) ────────────────────────────────
function CatSelect({
  options, value, onChange,
}: {
  options: readonly StaticCategory[]
  value: StaticCategory | null
  onChange: (v: StaticCategory | null) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  return (
    <div ref={ref} className="relative w-full">
      <DropdownButton
        label="Всички категории"
        selected={value?.name}
        open={open}
        onToggle={() => setOpen(v => !v)}
      />

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface-2 border border-border rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden">
          {value && <ClearRow onClear={() => { onChange(null); setOpen(false) }} />}
          <div className="max-h-52 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cc0000 #1a1a1a' }}>
            {options.map(opt => (
              <button
                key={opt.slug}
                type="button"
                onClick={() => { onChange(opt); setOpen(false) }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-border ${
                  value?.slug === opt.slug ? 'text-accent bg-accent/10' : 'text-muted-2 hover:text-white'
                }`}
              >
                {opt.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function HeroFilter() {
  const router = useRouter()

  const [makes,    setMakes]    = useState<Make[]>([])
  const [models,   setModels]   = useState<Model[]>([])

  const [selectedMake,     setSelectedMake]     = useState<Make | null>(null)
  const [selectedModel,    setSelectedModel]    = useState<Model | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<StaticCategory | null>(null)

  const [makesLoading,  setMakesLoading]  = useState(true)
  const [modelsLoading, setModelsLoading] = useState(false)
  // tracks whether we've already fetched models for this make (vs still loading)
  const [modelsFetched, setModelsFetched] = useState(false)

  useEffect(() => {
    fetch('/api/makes')
      .then(r => r.json())
      .then(d => setMakes(Array.isArray(d) ? d : []))
      .catch(() => setMakes([]))
      .finally(() => setMakesLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedMake) {
      setModels([])
      setSelectedModel(null)
      setModelsFetched(false)
      return
    }
    setModelsLoading(true)
    setModelsFetched(false)
    setSelectedModel(null)
    fetch(`/api/models?make=${selectedMake.slug}`)
      .then(r => r.json())
      .then(d => setModels(Array.isArray(d) ? d : []))
      .catch(() => setModels([]))
      .finally(() => { setModelsLoading(false); setModelsFetched(true) })
  }, [selectedMake])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (selectedMake)     params.set('make',     selectedMake.slug)
    if (selectedModel)    params.set('model',    selectedModel.name)
    if (selectedCategory) params.set('category', selectedCategory.slug)
    router.push(`/products?${params.toString()}`)
  }

  const hasFilter = selectedMake || selectedCategory

  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden">

      {/* Hero photo background */}
      <div className="absolute inset-0 bg-background" />
      {/* Desktop background */}
      <div className="hidden md:block absolute inset-0 bg-cover bg-center bg-no-repeat opacity-55"
        style={{ backgroundImage: 'url(/images/hero.webp)' }} />
      {/* Mobile background — portrait headlights image */}
      <div className="md:hidden absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
        style={{ backgroundImage: 'url(/images/hero-mobile.webp)' }} />
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, rgba(10,10,10,0.5) 0%, rgba(10,10,10,0.2) 40%, rgba(10,10,10,0.7) 100%)' }} />
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(180,0,0,0.15) 0%, transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-16 text-center">

        {/* Badges row */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
        <span className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent text-xs px-4 py-1.5 rounded-full font-semibold tracking-widest uppercase">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          LED Ivanov Auto
        </span>

        {/* Google rating badge */}
        <a
          href="https://www.google.com/maps/place/LED+IVANOV+AUTO/@42.6370748,23.3354294,17z"
          target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/12 rounded-full px-4 py-1.5 transition-colors"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M5.27 9.17A6.74 6.74 0 0112 5.25a6.7 6.7 0 014.75 1.97l3.55-3.55A11.25 11.25 0 0012 0 11.94 11.94 0 00.9 7.27l4.37 1.9z"/>
            <path fill="#34A853" d="M16.04 18.01A6.7 6.7 0 0112 19.25a6.74 6.74 0 01-6.37-4.56l-4.4 1.68A11.94 11.94 0 0012 24a11.25 11.25 0 007.5-2.87l-3.46-3.12z"/>
            <path fill="#4A90E2" d="M19.5 12.25c0-.7-.07-1.37-.19-2H12v3.79h4.19a3.6 3.6 0 01-1.56 2.36l3.46 3.12C20.33 17.55 19.5 15.07 19.5 12.25z"/>
            <path fill="#FBBC05" d="M5.63 14.69A6.74 6.74 0 015.27 12.25c0-.85.15-1.67.42-2.43L1.32 7.92A11.94 11.94 0 000 12.25c0 1.5.28 2.94.78 4.24l4.85-1.8z"/>
          </svg>
          <span className="flex items-center gap-1">
            <span className="text-white text-xs font-bold">4.9</span>
            <span className="flex gap-0.5">
              {[1,2,3,4,5].map(s => (
                <svg key={s} className="w-3 h-3 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </span>
            <span className="text-white/50 text-xs">· 250+ ревюта</span>
          </span>
        </a>
        </div>

        {/* Headline */}
        <h1 className="font-display font-bold leading-none mb-2 tracking-wide uppercase"
          style={{ fontSize: 'clamp(2.4rem, 7vw, 5rem)' }}>
          ШОФИРАЙ <span className="text-accent">УВЕРЕНО,</span>
        </h1>
        <h2 className="font-display font-bold leading-none text-white/85 mb-6 tracking-wide uppercase"
          style={{ fontSize: 'clamp(1.8rem, 5.5vw, 4rem)' }}>
          ДОРИ В НАЙ-ТЪМНАТА НОЩ
        </h2>
        <p className="text-muted text-sm sm:text-base max-w-lg mx-auto mb-10 leading-relaxed">
          Висококачествени LED крушки за фарове — Plug & Play монтаж, без CanBus грешки, с до 2 години гаранция.
        </p>

        {/* ── Filter card ── */}
        <div className="bg-black/55 backdrop-blur-sm border border-white/8 rounded-2xl overflow-visible max-w-3xl mx-auto text-left p-5">

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

            {/* Марка */}
            <div>
              <p className="text-[11px] text-muted uppercase tracking-widest mb-1.5 font-semibold">Марка</p>
              {makesLoading ? (
                <div className="skeleton rounded-xl h-11.5" />
              ) : (
                <DynSelect
                  placeholder="Избери марка"
                  options={makes}
                  value={selectedMake}
                  onChange={v => { setSelectedMake(v); if (!v) setSelectedModel(null) }}
                />
              )}
            </div>

            {/* Модел */}
            <div>
              <p className="text-[11px] text-muted uppercase tracking-widest mb-1.5 font-semibold">Модел</p>
              <DynSelect
                placeholder={selectedMake ? 'Избери модел' : 'Първо избери марка'}
                options={models}
                value={selectedModel}
                onChange={setSelectedModel}
                disabled={!selectedMake}
                loading={modelsLoading}
                emptyHint={
                  modelsFetched && models.length === 0
                    ? 'Без конкретни модели — ще търси всички за марката'
                    : undefined
                }
              />
            </div>

            {/* Категория */}
            <div>
              <p className="text-[11px] text-muted uppercase tracking-widest mb-1.5 font-semibold">Категория</p>
              <CatSelect
                options={PRODUCT_CATEGORIES}
                value={selectedCategory}
                onChange={setSelectedCategory}
              />
            </div>
          </div>

          {/* Search button */}
          <div className="mt-4">
            <button
              onClick={handleSearch}
              className="w-full bg-accent hover:bg-accent-hover text-white py-3.5 rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35" strokeLinecap="round"/>
              </svg>
              {hasFilter
                ? `Търси${selectedMake ? ` за ${selectedMake.name}${selectedModel ? ` ${selectedModel.name}` : ''}` : ''}${selectedCategory ? ` · ${selectedCategory.name}` : ''}`
                : 'Търси всички продукти'
              }
            </button>
          </div>
        </div>

        {/* Skip filter link */}
        <div className="mt-5">
          <Link href="/products" className="text-muted hover:text-white text-sm transition-colors inline-flex items-center gap-1">
            Виж всички продукти
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
