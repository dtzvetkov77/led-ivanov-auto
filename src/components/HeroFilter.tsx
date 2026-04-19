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
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-55"
        style={{ backgroundImage: 'url(/images/hero.webp)' }} />
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, rgba(10,10,10,0.4) 0%, rgba(10,10,10,0.15) 50%, rgba(10,10,10,0.65) 100%)' }} />
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(180,0,0,0.15) 0%, transparent 70%)' }} />

      {/* Mobile headlight image */}
      <div className="md:hidden absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-1">
        <img
          src="/images/hero-mobile.webp"
          alt=""
          className="w-72 object-contain opacity-40 select-none"
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-16 text-center">

        {/* Badge */}
        <span className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent text-xs px-4 py-1.5 rounded-full font-semibold mb-6 tracking-widest uppercase">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          LED Ivanov Auto
        </span>

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
          Осигури си кристално ясна картина, по-бърза реакция и пълна безопасност на пътя.
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
