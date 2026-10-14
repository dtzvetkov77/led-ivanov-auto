'use client'
import { useState, type ReactNode } from 'react'
import type { ProductAttribute } from '@/lib/types'

type Props = {
  description: ReactNode
  attributes: ProductAttribute[]
}

export default function ProductDescriptionTabs({ description, attributes }: Props) {
  const nonVariationAttrs = attributes.filter(a => !a.variation && a.options.length > 0)

  const tabs = [
    ...(description ? [{ id: 'description' as const, label: 'Описание' }] : []),
    ...(nonVariationAttrs.length > 0 ? [{ id: 'specs' as const, label: 'Характеристики' }] : []),
  ]
  const [tab, setTab] = useState<'description' | 'specs'>(tabs[0]?.id ?? 'description')

  if (tabs.length === 0) return null

  return (
    <div className="border-t border-border pt-10">
      {/* Tab bar */}
      <div className="flex gap-1 mb-8 border-b border-border">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              tab === t.id
                ? 'border-accent text-white'
                : 'border-transparent text-muted hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'description' && description}

      {tab === 'specs' && (
        <div className="max-w-2xl">
          <table className="w-full text-sm border-collapse">
            <tbody>
              {nonVariationAttrs.map(attr => (
                <tr key={attr.name} className="border-b border-border last:border-0">
                  <td className="py-3 pr-6 text-white/70 font-medium w-40 align-top">{attr.name}</td>
                  <td className="py-3 text-white">{attr.options.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
