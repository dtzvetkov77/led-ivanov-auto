'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

type RelType = 'bundle' | 'upsell' | 'downsell' | 'crosssell'
type RelProduct = { id: string; name: string; price: number; sale_price: number | null; images: string[] }
type Relation = { id: string; related_id: string; type: RelType; position: number; product: RelProduct }

const TYPES: { value: RelType; label: string; desc: string }[] = [
  { value: 'bundle',    label: 'Пакет (FBT)',  desc: 'Показва се на страницата на продукта — "Купи комплект"' },
  { value: 'upsell',   label: 'Upsell',        desc: 'Показва се в количката — "Виж и"' },
  { value: 'downsell', label: 'Downsell',      desc: 'Показва се в checkout — по-евтина алтернатива' },
  { value: 'crosssell',label: 'Cross-sell',    desc: 'Показва се в чекмеджето на количката — "Добавете също"' },
]

export default function ProductRelationsManager({ productId }: { productId: string }) {
  const supabase = createClient()
  const [activeType, setActiveType] = useState<RelType>('bundle')
  const [relations, setRelations] = useState<Relation[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<RelProduct[]>([])
  const [searching, setSearching] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)

  const loadRelations = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('product_relations')
      .select('id, related_id, type, position, product:products!related_id(id, name, price, sale_price, images)')
      .eq('product_id', productId)
      .order('type')
      .order('position')
    setRelations((data ?? []) as unknown as Relation[])
    setLoading(false)
  }, [productId])

  useEffect(() => { loadRelations() }, [loadRelations])

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    const t = setTimeout(async () => {
      setSearching(true)
      const existingIds = new Set(relations.filter(r => r.type === activeType).map(r => r.related_id))
      existingIds.add(productId)
      const { data } = await supabase
        .from('products')
        .select('id, name, price, sale_price, images')
        .ilike('name', `%${query}%`)
        .eq('published', true)
        .limit(8)
      setResults(((data ?? []) as RelProduct[]).filter(p => !existingIds.has(p.id)))
      setSearching(false)
    }, 300)
    return () => clearTimeout(t)
  }, [query, activeType, relations, productId])

  async function addRelation(related: RelProduct) {
    setSaving(related.id)
    const pos = relations.filter(r => r.type === activeType).length
    const { error } = await supabase
      .from('product_relations')
      .insert({ product_id: productId, related_id: related.id, type: activeType, position: pos })
    if (!error) {
      await loadRelations()
      setQuery('')
      setResults([])
    }
    setSaving(null)
  }

  async function removeRelation(id: string) {
    setSaving(id)
    await supabase.from('product_relations').delete().eq('id', id)
    setRelations(prev => prev.filter(r => r.id !== id))
    setSaving(null)
  }

  const typeRelations = relations.filter(r => r.type === activeType)
  const inputCls = 'w-full bg-[#0a0a0a] border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent transition-colors'

  return (
    <div className="bg-[#0a0a0a] border border-border rounded-xl p-4 mt-6 max-w-2xl">
      <p className="text-xs text-muted uppercase tracking-wider mb-3 font-medium">Свързани продукти</p>

      {/* Type tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {TYPES.map(t => (
          <button
            key={t.value}
            type="button"
            onClick={() => { setActiveType(t.value); setQuery(''); setResults([]) }}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors border ${
              activeType === t.value
                ? 'bg-accent/15 border-accent text-accent'
                : 'border-border text-muted hover:border-accent/50'
            }`}
          >
            {t.label}
            {relations.filter(r => r.type === t.value).length > 0 && (
              <span className="ml-1.5 bg-accent text-white text-[10px] px-1 rounded-full">
                {relations.filter(r => r.type === t.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted/60 mb-3">{TYPES.find(t => t.value === activeType)?.desc}</p>

      {/* Current relations */}
      {loading ? (
        <p className="text-xs text-muted py-2">Зареждане...</p>
      ) : typeRelations.length > 0 ? (
        <div className="space-y-2 mb-4">
          {typeRelations.map(r => (
            <div key={r.id} className="flex items-center gap-3 bg-background border border-border rounded-lg p-2">
              {r.product.images?.[0] && (
                <img src={r.product.images[0]} alt={r.product.name} className="w-9 h-9 rounded object-cover shrink-0 border border-border" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1">{r.product.name}</p>
                <p className="text-xs text-accent">{(r.product.sale_price ?? r.product.price).toFixed(2)} €</p>
              </div>
              <button
                type="button"
                onClick={() => removeRelation(r.id)}
                disabled={saving === r.id}
                className="shrink-0 text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded border border-border hover:border-red-500/40 transition-colors disabled:opacity-40"
              >
                Премахни
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted/50 mb-4">Няма добавени продукти от тип «{TYPES.find(t => t.value === activeType)?.label}»</p>
      )}

      {/* Search + add */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Търси продукт по име..."
          className={inputCls}
        />
        {(results.length > 0 || searching) && (
          <div className="absolute top-full left-0 right-0 z-20 bg-[#111] border border-border rounded-lg mt-1 shadow-xl overflow-hidden">
            {searching ? (
              <p className="text-xs text-muted px-3 py-2">Търсене...</p>
            ) : results.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => addRelation(p)}
                disabled={saving === p.id}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 transition-colors text-left disabled:opacity-40"
              >
                {p.images?.[0] && (
                  <img src={p.images[0]} alt={p.name} className="w-8 h-8 rounded object-cover shrink-0 border border-border" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm line-clamp-1">{p.name}</p>
                  <p className="text-xs text-accent">{(p.sale_price ?? p.price).toFixed(2)} €</p>
                </div>
                <span className="shrink-0 text-xs text-accent">+ Добави</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
