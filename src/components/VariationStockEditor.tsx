'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ProductVariation } from '@/lib/types'

type Props = {
  productId: string
  variations: ProductVariation[]
}

export default function VariationStockEditor({ productId, variations: initial }: Props) {
  const [variations, setVariations] = useState<ProductVariation[]>(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const set = (idx: number, field: keyof ProductVariation, value: string) => {
    setVariations(prev => prev.map((v, i) => {
      if (i !== idx) return v
      if (field === 'stock_quantity') return { ...v, stock_quantity: value === '' ? null : parseInt(value, 10) }
      if (field === 'price') return { ...v, price: value === '' ? 0 : parseFloat(value) }
      if (field === 'sale_price') return { ...v, sale_price: value === '' ? null : parseFloat(value) }
      return v
    }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    const supabase = createClient()

    // Sync base price to min variation price so product cards show correct price
    const minPrice = Math.min(...variations.map(v => v.price).filter(p => p > 0))
    const hasSale = variations.some(v => v.sale_price != null && v.sale_price > 0)
    const minSalePrice = hasSale
      ? Math.min(...variations.filter(v => v.sale_price != null && v.sale_price! > 0).map(v => v.sale_price!))
      : null

    const { error: err } = await supabase
      .from('products')
      .update({
        variations,
        price: isFinite(minPrice) ? minPrice : 0,
        sale_price: minSalePrice,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)
    setSaving(false)
    if (err) { setError(err.message); return }
    setSaved(true)
  }

  if (variations.length === 0) return null

  return (
    <div className="bg-background border border-border rounded-xl p-4 space-y-4">
      <p className="text-xs text-muted uppercase tracking-wider font-medium">Вариации — цена, промо и наличност</p>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <div className="space-y-3">
        {variations.map((v, i) => {
          const label = Object.entries(v.attributes).map(([k, val]) => `${k}: ${val}`).join(', ')
          return (
            <div key={i} className="bg-background border border-border rounded-xl p-3 space-y-2">
              <p className="text-xs font-semibold text-white">{label}</p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Цена €</p>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={v.price}
                    onChange={e => set(i, 'price', e.target.value)}
                    className="w-full bg-surface border border-border rounded-lg px-2 py-1.5 text-white text-sm text-center focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Промо €</p>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={v.sale_price ?? ''}
                    onChange={e => set(i, 'sale_price', e.target.value)}
                    placeholder="—"
                    className="w-full bg-surface border border-border rounded-lg px-2 py-1.5 text-white text-sm text-center focus:outline-none focus:border-accent transition-colors placeholder:text-muted"
                  />
                </div>
                <div>
                  <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Наличност</p>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      value={v.stock_quantity ?? ''}
                      onChange={e => set(i, 'stock_quantity', e.target.value)}
                      placeholder="∞"
                      className="w-full bg-surface border border-border rounded-lg px-2 py-1.5 text-white text-sm text-center focus:outline-none focus:border-accent transition-colors placeholder:text-muted"
                    />
                    {v.stock_quantity === 0 && (
                      <span className="text-[10px] text-red-400 font-medium shrink-0">!</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="text-xs font-semibold bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg disabled:opacity-40 transition-colors"
      >
        {saving ? 'Запис...' : saved ? '✓ Записано' : 'Запази вариации'}
      </button>
    </div>
  )
}
