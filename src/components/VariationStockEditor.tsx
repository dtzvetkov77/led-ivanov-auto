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

  const setStock = (idx: number, value: string) => {
    setVariations(prev => prev.map((v, i) =>
      i === idx ? { ...v, stock_quantity: value === '' ? null : parseInt(value, 10) } : v
    ))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase
      .from('products')
      .update({ variations, updated_at: new Date().toISOString() })
      .eq('id', productId)
    setSaving(false)
    if (err) { setError(err.message); return }
    setSaved(true)
  }

  if (variations.length === 0) return null

  return (
    <div className="bg-[#0a0a0a] border border-border rounded-xl p-4 space-y-3">
      <p className="text-xs text-muted uppercase tracking-wider font-medium">Наличност — вариации</p>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <div className="space-y-2">
        {variations.map((v, i) => {
          const label = Object.entries(v.attributes).map(([k, val]) => `${k}: ${val}`).join(', ')
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="text-sm text-muted flex-1 truncate">{label}</span>
              <input
                type="number"
                min="0"
                value={v.stock_quantity ?? ''}
                onChange={e => setStock(i, e.target.value)}
                placeholder="∞"
                className="w-24 bg-background border border-border rounded-lg px-3 py-1.5 text-white text-sm text-center focus:outline-none focus:border-accent transition-colors"
              />
              {v.stock_quantity === 0 && (
                <span className="text-xs text-red-400 font-medium shrink-0">Изчерпан</span>
              )}
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
        {saving ? 'Запис...' : saved ? '✓ Записано' : 'Запази наличност'}
      </button>
    </div>
  )
}
