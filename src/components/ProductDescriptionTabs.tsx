'use client'
import { useState } from 'react'
import type { ProductAttribute } from '@/lib/types'

type Props = {
  description: string
  attributes: ProductAttribute[]
}

export default function ProductDescriptionTabs({ description, attributes }: Props) {
  const [tab, setTab] = useState<'description' | 'specs'>('description')

  const nonVariationAttrs = attributes.filter(a => !a.variation && a.options.length > 0)

  const tabs = [
    { id: 'description' as const, label: 'Описание' },
    ...(nonVariationAttrs.length > 0 ? [{ id: 'specs' as const, label: 'Характеристики' }] : []),
  ]

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

      {tab === 'description' && (
        <div
          className="prose prose-invert prose-sm max-w-none text-muted leading-relaxed
            prose-headings:text-white prose-headings:font-bold
            prose-strong:text-white prose-li:marker:text-accent
            prose-a:text-accent prose-a:no-underline hover:prose-a:underline
            prose-table:border-collapse prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2
            prose-th:border prose-th:border-border prose-th:px-3 prose-th:py-2 prose-th:bg-surface"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}

      {tab === 'specs' && (
        <div className="max-w-2xl">
          <table className="w-full text-sm border-collapse">
            <tbody>
              {nonVariationAttrs.map(attr => (
                <tr key={attr.name} className="border-b border-border last:border-0">
                  <td className="py-3 pr-6 text-muted font-medium w-40 align-top">{attr.name}</td>
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
