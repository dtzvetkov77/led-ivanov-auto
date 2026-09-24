'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { ProductAttribute, ProductVariation } from '@/lib/types'

type Props = {
  productId: string
  attributes: ProductAttribute[]
  variations: ProductVariation[]
  basePrice: number
}

// Local editing shapes. Variation values are stored positionally (aligned with
// `attrs`) so renaming or removing an attribute doesn't orphan variation keys.
type AttrDraft = { name: string; optionsText: string }
type Row = {
  values: string[]
  price: string
  sale_price: string
  stock_quantity: string
  sku: string
  images: string[]
}

const parseOptions = (text: string) =>
  Array.from(new Set(text.split(',').map(o => o.trim()).filter(Boolean)))

// BG users type "," as decimal separator
const normalizePrice = (value: string) => value.replace(',', '.').replace(/[^0-9.]/g, '')

export default function VariationStockEditor({ productId, attributes, variations: initial, basePrice }: Props) {
  const router = useRouter()
  // Non-variation attributes (shown in the description tab) are kept untouched.
  const staticAttrs = attributes.filter(a => !a.variation)
  const [attrs, setAttrs] = useState<AttrDraft[]>(() =>
    attributes.filter(a => a.variation).map(a => ({ name: a.name, optionsText: a.options.join(', ') }))
  )
  const [rows, setRows] = useState<Row[]>(() => initial.map(v => ({
    values: attributes.filter(a => a.variation).map(a => v.attributes[a.name] ?? ''),
    price: String(v.price ?? ''),
    sale_price: v.sale_price != null ? String(v.sale_price) : '',
    stock_quantity: v.stock_quantity != null ? String(v.stock_quantity) : '',
    sku: v.sku ?? '',
    images: v.images ?? [],
  })))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const touch = () => setSaved(false)
  const defaultPrice = basePrice > 0 ? String(basePrice) : ''
  const emptyRow = (values: string[]): Row => ({
    values, price: defaultPrice, sale_price: '', stock_quantity: '', sku: '', images: [],
  })

  const addAttr = () => {
    setAttrs(prev => [...prev, { name: '', optionsText: '' }])
    setRows(prev => prev.map(r => ({ ...r, values: [...r.values, ''] })))
    touch()
  }

  const removeAttr = (idx: number) => {
    setAttrs(prev => prev.filter((_, i) => i !== idx))
    setRows(prev => prev.map(r => ({ ...r, values: r.values.filter((_, i) => i !== idx) })))
    touch()
  }

  const updateAttr = (idx: number, field: keyof AttrDraft, value: string) => {
    setAttrs(prev => prev.map((a, i) => i === idx ? { ...a, [field]: value } : a))
    touch()
  }

  const addRow = () => {
    setRows(prev => [...prev, emptyRow(attrs.map(() => ''))])
    touch()
  }

  const removeRow = (idx: number) => {
    setRows(prev => prev.filter((_, i) => i !== idx))
    touch()
  }

  const updateRow = (idx: number, field: Exclude<keyof Row, 'values' | 'images'>, value: string) => {
    const v = field === 'price' || field === 'sale_price' ? normalizePrice(value)
      : field === 'stock_quantity' ? value.replace(/[^0-9]/g, '')
      : value
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: v } : r))
    touch()
  }

  const updateRowValue = (idx: number, attrIdx: number, value: string) => {
    setRows(prev => prev.map((r, i) => i === idx
      ? { ...r, values: r.values.map((val, j) => j === attrIdx ? value : val) }
      : r))
    touch()
  }

  // Adds every missing combination of attribute options; existing rows are kept.
  const generateAll = () => {
    const optionLists = attrs.map(a => parseOptions(a.optionsText))
    if (optionLists.length === 0 || optionLists.some(o => o.length === 0)) {
      setError('Попълнете име и стойности за всеки атрибут преди генериране.')
      return
    }
    const combos = optionLists.reduce<string[][]>(
      (acc, opts) => acc.flatMap(c => opts.map(o => [...c, o])),
      [[]]
    )
    const existing = new Set(rows.map(r => JSON.stringify(r.values)))
    const missing = combos.filter(c => !existing.has(JSON.stringify(c)))
    setRows(prev => [...prev, ...missing.map(emptyRow)])
    setError('')
    touch()
  }

  const handleSave = async () => {
    setError('')
    const names = attrs.map(a => a.name.trim())
    const optionLists = attrs.map(a => parseOptions(a.optionsText))

    if (rows.length > 0 && attrs.length === 0) {
      setError('Добавете поне един атрибут (напр. Цокъл).'); return
    }
    if (names.some(n => !n)) { setError('Всеки атрибут трябва да има име.'); return }
    if (new Set(names).size !== names.length) { setError('Имената на атрибутите се повтарят.'); return }
    if (optionLists.some(o => o.length === 0)) { setError('Всеки атрибут трябва да има поне една стойност.'); return }

    const seen = new Set<string>()
    for (const [i, r] of rows.entries()) {
      const n = i + 1
      if (r.values.some((val, j) => !val || !optionLists[j].includes(val))) {
        setError(`Вариация #${n}: изберете стойност за всеки атрибут.`); return
      }
      const key = JSON.stringify(r.values)
      if (seen.has(key)) { setError(`Вариация #${n} се повтаря.`); return }
      seen.add(key)
      const price = parseFloat(r.price)
      if (!(price > 0)) { setError(`Вариация #${n}: въведете цена.`); return }
      if (r.sale_price && !(parseFloat(r.sale_price) > 0 && parseFloat(r.sale_price) < price)) {
        setError(`Вариация #${n}: промо цената трябва да е по-ниска от цената.`); return
      }
    }

    const variations: ProductVariation[] = rows.map(r => ({
      attributes: Object.fromEntries(names.map((name, j) => [name, r.values[j]])),
      price: parseFloat(r.price),
      sale_price: r.sale_price ? parseFloat(r.sale_price) : null,
      sku: r.sku.trim() || null,
      images: r.images,
      stock_quantity: r.stock_quantity === '' ? null : parseInt(r.stock_quantity, 10),
    }))
    const newAttributes: ProductAttribute[] = [
      ...staticAttrs,
      ...names.map((name, j) => ({ name, options: optionLists[j], variation: true })),
    ]

    const update: Record<string, unknown> = {
      attributes: newAttributes,
      variations,
      updated_at: new Date().toISOString(),
    }
    // Sync base price to min variation price so product cards show correct price
    if (variations.length > 0) {
      update.price = Math.min(...variations.map(v => v.price))
      const sales = variations.map(v => v.sale_price).filter((p): p is number => p != null)
      update.sale_price = sales.length > 0 ? Math.min(...sales) : null
    }

    setSaving(true)
    const supabase = createClient()
    const { error: err } = await supabase.from('products').update(update).eq('id', productId)
    setSaving(false)
    if (err) { setError(err.message); return }
    setSaved(true)
    router.refresh()
  }

  const inputCls = 'w-full bg-surface border border-border rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-muted'
  const labelCls = 'text-[10px] text-muted uppercase tracking-wider mb-1'
  const btnSecondary = 'text-xs font-semibold border border-border hover:border-accent text-white px-3 py-2 rounded-lg transition-colors'

  return (
    <div className="bg-background border border-border rounded-xl p-4 space-y-5">
      <div>
        <p className="text-xs text-muted uppercase tracking-wider font-medium">Вариации</p>
        <p className="text-[11px] text-muted/60 mt-1">
          Добавете атрибут (напр. Цокъл) със стойности, разделени със запетая (напр. H1, H7, H11), после генерирайте или добавете вариации.
        </p>
      </div>

      {/* Attributes */}
      <div className="space-y-2">
        {attrs.map((a, i) => (
          <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-end">
            <div>
              <p className={labelCls}>Атрибут</p>
              <input value={a.name} onChange={e => updateAttr(i, 'name', e.target.value)} placeholder="Цокъл" className={inputCls} />
            </div>
            <div>
              <p className={labelCls}>Стойности</p>
              <input value={a.optionsText} onChange={e => updateAttr(i, 'optionsText', e.target.value)} placeholder="H1, H7, H11" className={inputCls} />
            </div>
            <button type="button" onClick={() => removeAttr(i)} className="text-xs text-red-400 hover:text-red-300 px-2 py-2" aria-label="Премахни атрибут">
              Премахни
            </button>
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={addAttr} className={btnSecondary}>+ Атрибут</button>
          {attrs.length > 0 && (
            <button type="button" onClick={generateAll} className={btnSecondary}>Генерирай всички комбинации</button>
          )}
        </div>
      </div>

      {/* Variation rows */}
      {rows.length > 0 && (
        <div className="space-y-3">
          {rows.map((r, i) => (
            <div key={i} className="bg-background border border-border rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-white">Вариация #{i + 1}</p>
                <button type="button" onClick={() => removeRow(i)} className="text-xs text-red-400 hover:text-red-300">
                  Изтрий
                </button>
              </div>
              {attrs.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {attrs.map((a, j) => {
                    const opts = parseOptions(a.optionsText)
                    const current = r.values[j] ?? ''
                    return (
                      <div key={j}>
                        <p className={labelCls}>{a.name || `Атрибут ${j + 1}`}</p>
                        <select value={current} onChange={e => updateRowValue(i, j, e.target.value)} className={inputCls}>
                          <option value="">— избери —</option>
                          {current && !opts.includes(current) && <option value={current}>{current} (липсва)</option>}
                          {opts.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                    )
                  })}
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <p className={labelCls}>Цена €</p>
                  <input type="text" inputMode="decimal" value={r.price} onChange={e => updateRow(i, 'price', e.target.value)} className={`${inputCls} text-center`} />
                </div>
                <div>
                  <p className={labelCls}>Промо €</p>
                  <input type="text" inputMode="decimal" value={r.sale_price} onChange={e => updateRow(i, 'sale_price', e.target.value)} placeholder="—" className={`${inputCls} text-center`} />
                </div>
                <div>
                  <p className={labelCls}>Наличност</p>
                  <input type="text" inputMode="numeric" value={r.stock_quantity} onChange={e => updateRow(i, 'stock_quantity', e.target.value)} placeholder="∞" className={`${inputCls} text-center ${r.stock_quantity === '0' ? 'border-red-400/60' : ''}`} />
                </div>
                <div>
                  <p className={labelCls}>SKU</p>
                  <input type="text" value={r.sku} onChange={e => updateRow(i, 'sku', e.target.value)} placeholder="—" className={`${inputCls} text-center`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <div className="flex flex-wrap gap-2">
        {attrs.length > 0 && (
          <button type="button" onClick={addRow} className={btnSecondary}>+ Вариация</button>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="text-xs font-semibold bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg disabled:opacity-40 transition-colors"
        >
          {saving ? 'Запис...' : saved ? '✓ Записано' : 'Запази вариации'}
        </button>
      </div>
    </div>
  )
}
