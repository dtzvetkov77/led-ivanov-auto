import type { DescBlock, Spec } from '@/lib/format-description'

const Check = () => (
  <span className="mt-0.5 w-5 h-5 rounded-full bg-accent/15 text-accent flex items-center justify-center shrink-0">
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
)

export function SpecTable({ items }: { items: Spec[] }) {
  return (
    <dl className="rounded-xl border border-border overflow-hidden text-sm">
      {items.map((s, i) => (
        <div key={i} className={`grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 px-4 py-3 ${i % 2 ? 'bg-surface' : 'bg-surface-2'}`}>
          <dt className="text-white/70">{s.key}</dt>
          <dd className="text-white font-semibold">{s.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export default function ProductDescription({ blocks }: { blocks: DescBlock[] }) {
  return (
    <div className="max-w-3xl space-y-4 text-white">
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'heading':
            return (
              <h3 key={i} className="flex items-center gap-2.5 text-lg font-black pt-4 first:pt-0">
                <span className="w-1 h-5 bg-accent rounded-full" />
                {b.text}
              </h3>
            )
          case 'paragraph':
            return <p key={i} className="text-[15px] leading-relaxed text-white/90">{b.text}</p>
          case 'specs':
            return <SpecTable key={i} items={b.items} />
          case 'bullets':
            return (
              <ul key={i} className="space-y-2.5">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-3 text-[15px] leading-relaxed">
                    <Check />
                    <span className="text-white/90">
                      {it.title && <strong className="text-white font-bold">{it.title}</strong>}
                      {it.title && ' — '}
                      {it.text}
                    </span>
                  </li>
                ))}
              </ul>
            )
        }
      })}
    </div>
  )
}

// Rich HTML descriptions (tables, images) we can't restructure: same typography, white text
export function RichDescription({ html }: { html: string }) {
  return (
    <div className="overflow-x-auto">
      <div
        className="prose prose-invert max-w-3xl text-white/90 leading-relaxed
          prose-p:text-white/90 prose-li:text-white/90 prose-headings:text-white prose-headings:font-black
          prose-strong:text-white prose-li:marker:text-accent
          prose-a:text-accent prose-a:no-underline hover:prose-a:underline
          prose-table:border-collapse prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2
          prose-th:border prose-th:border-border prose-th:px-3 prose-th:py-2 prose-th:bg-surface
          [&_img]:max-w-full [&_img]:h-auto **:wrap-break-word"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
