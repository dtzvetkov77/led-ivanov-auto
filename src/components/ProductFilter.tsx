'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

type Make = { id: string; name: string; slug: string }
type Model = { id: string; make_id: string; name: string }

const SORT_OPTIONS = [
  { value: 'position',   label: 'По подразбиране' },
  { value: 'price_asc',  label: 'Цена: ниска → висока' },
  { value: 'price_desc', label: 'Цена: висока → ниска' },
  { value: 'newest',     label: 'Най-нови' },
]

const LIMIT = 10

type Props = {
  /** Populated after full import — enables make+model hierarchical filter */
  makes: Make[]
  models: Model[]
  /** Fallback: WC categories = car makes, used when makes table is empty */
  categories: Make[]
  activeMake?: string
  activeModel?: string
  activeCategory?: string
  activeSort?: string
}

export default function ProductFilter({
  makes, models, categories,
  activeMake, activeModel, activeCategory, activeSort,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [showAll, setShowAll] = useState(false)
  const [showAllModels, setShowAllModels] = useState(false)

  // Use makes table when populated; fall back to categories (also car makes)
  const useMakesTable = makes.length > 0
  const brandList: Make[] = useMakesTable ? makes : categories

  // Active brand selection — works across both param sources
  const activeBrandSlug = useMakesTable ? activeMake : (activeCategory ?? activeMake)
  const selectedBrand = brandList.find(b => b.slug === activeBrandSlug) ?? null

  const availableModels = useMakesTable && selectedBrand
    ? models.filter(m => m.make_id === selectedBrand.id)
    : []

  const visibleBrands = showAll ? brandList : brandList.slice(0, LIMIT)
  const visibleModels = showAllModels ? availableModels : availableModels.slice(0, LIMIT)

  function navigate(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v)
      else params.delete(k)
    }
    startTransition(() => router.push(`/products?${params.toString()}`))
  }

  function selectBrand(slug: string | undefined) {
    if (useMakesTable) {
      navigate({ make: slug, model: undefined, category: undefined })
    } else {
      // fallback: categories-as-makes, use `category` param
      navigate({ category: slug, make: undefined, model: undefined })
    }
  }

  function selectModel(name: string | undefined) {
    navigate({ model: name })
  }

  function selectSort(value: string) {
    navigate({ sort: value === 'position' ? undefined : value })
  }

  const isActive = (slug: string) => activeBrandSlug === slug

  return (
    <div className="bg-surface border border-border rounded-xl p-4 mb-6 space-y-4">

      {/* ── МАРКА ── */}
      <div>
        <p className="text-xs text-muted uppercase tracking-wider mb-2.5 font-medium">Марка</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => selectBrand(undefined)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              !activeBrandSlug
                ? 'bg-accent border-accent text-white'
                : 'border-border text-muted hover:border-accent hover:text-white'
            }`}
          >
            Всички
          </button>

          {visibleBrands.map(brand => (
            <button
              key={brand.id}
              onClick={() => selectBrand(isActive(brand.slug) ? undefined : brand.slug)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                isActive(brand.slug)
                  ? 'bg-accent border-accent text-white'
                  : 'border-border text-muted hover:border-accent hover:text-white'
              }`}
            >
              {brand.name}
            </button>
          ))}

          {brandList.length > LIMIT && (
            <button
              onClick={() => setShowAll(v => !v)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-dashed border-border text-muted hover:border-accent hover:text-white transition-colors"
            >
              {showAll ? 'По-малко ↑' : `+${brandList.length - LIMIT} повече`}
            </button>
          )}
        </div>
      </div>

      {/* ── МОДЕЛ (only when makes table is populated and a brand is selected) ── */}
      {useMakesTable && selectedBrand && availableModels.length > 0 && (
        <div>
          <p className="text-xs text-muted uppercase tracking-wider mb-2.5 font-medium">
            Модел — <span className="text-white">{selectedBrand.name}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => selectModel(undefined)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                !activeModel
                  ? 'bg-accent border-accent text-white'
                  : 'border-border text-muted hover:border-accent hover:text-white'
              }`}
            >
              Всички модели
            </button>
            {visibleModels.map(model => (
              <button
                key={model.id}
                onClick={() => selectModel(activeModel === model.name ? undefined : model.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  activeModel === model.name
                    ? 'bg-accent border-accent text-white'
                    : 'border-border text-muted hover:border-accent hover:text-white'
                }`}
              >
                {model.name}
              </button>
            ))}
            {availableModels.length > LIMIT && (
              <button
                onClick={() => setShowAllModels(v => !v)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-dashed border-border text-muted hover:border-accent hover:text-white transition-colors"
              >
                {showAllModels ? 'По-малко ↑' : `+${availableModels.length - LIMIT} повече`}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── SORT ── */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">
          {!useMakesTable && brandList.length > 0 && (
            <span className="text-accent/70">Импортирайте отново за филтър по модел</span>
          )}
        </p>
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted uppercase tracking-wider font-medium">Сортиране</p>
          <select
            value={activeSort ?? 'position'}
            onChange={e => selectSort(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent cursor-pointer"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
