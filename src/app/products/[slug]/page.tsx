import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductGallery from '@/components/ProductGallery'
import ProductActions from '@/components/ProductActions'
import ProductDescriptionTabs from '@/components/ProductDescriptionTabs'
import Link from 'next/link'
function sanitize(html: string) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/on\w+="[^"]*"/gi, '')
}
import type { Product } from '@/lib/types'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, short_description, images')
    .eq('slug', slug)
    .single()
  if (!product) return { title: 'LED Ivanov Auto' }
  return {
    title: `${product.name} | LED Ivanov Auto`,
    description: product.short_description?.slice(0, 160) ?? undefined,
    openGraph: product.images?.[0]
      ? { images: [{ url: product.images[0] }] }
      : undefined,
  }
}

const TRUST = [
  {
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    title: '2 год. гаранция',
    sub: 'На всички продукти',
  },
  {
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    title: 'Plug & Play',
    sub: 'Монтаж за 5 минути',
  },
  {
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m0 0h1.172a2 2 0 011.414.586l2.828 2.828A2 2 0 0121 13.172V17a2 2 0 01-2 2h-1m-6 0a2 2 0 100 4 2 2 0 000-4zm6 0a2 2 0 100 4 2 2 0 000-4z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    title: 'Доставка 1–2 дни',
    sub: 'Еконт / Спиди',
  },
  {
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    title: 'Поддръжка 24/7',
    sub: 'Viber / Messenger',
  },
]

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*, category:categories!category_id(name, slug)')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (productError || !product) notFound()

  const p = product as Product & { category: { name: string; slug: string } | null }

  // Related: same category, different product
  const { data: related } = p.category_id
    ? await supabase
        .from('products')
        .select('id, name, slug, price, sale_price, images')
        .eq('published', true)
        .eq('category_id', p.category_id)
        .neq('id', p.id)
        .limit(4)
    : { data: [] }

  const cleanDescription = p.description ? sanitize(p.description) : null

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 overflow-x-hidden">

      {/* Breadcrumb */}
      <nav className="text-xs text-muted mb-6 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-white transition-colors">Начало</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-white transition-colors">Продукти</Link>
        {p.category && (
          <>
            <span>/</span>
            <Link href={`/products?category=${p.category.slug}`} className="hover:text-white transition-colors">{p.category.name}</Link>
          </>
        )}
        <span>/</span>
        <span className="text-white line-clamp-1">{p.name}</span>
      </nav>

      {/* Main grid */}
      <div className="grid md:grid-cols-2 gap-6 md:gap-10 mb-12">

        {/* Gallery */}
        <div className="min-w-0">
          <ProductGallery images={p.images} name={p.name} />
        </div>

        {/* Info */}
        <div className="flex flex-col min-w-0">
          {p.category && (
            <Link
              href={`/products?category=${p.category.slug}`}
              className="text-accent text-xs uppercase tracking-[3px] font-bold hover:underline mb-3 inline-block"
            >
              {p.category.name}
            </Link>
          )}

          <h1 className="text-2xl md:text-3xl font-black mb-4 leading-tight wrap-break-word">{p.name}</h1>

          {p.short_description && (
            <div
              className="text-muted text-sm mb-6 leading-relaxed wrap-break-word overflow-hidden"
              dangerouslySetInnerHTML={{ __html: sanitize(p.short_description) }}
            />
          )}

          {/* Price + variation + add to cart */}
          <ProductActions product={p} />

          {/* Separator */}
          <div className="h-px bg-border my-6" />

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-3">
            {TRUST.map(b => (
              <div key={b.title} className="flex items-center gap-3 bg-surface border border-border rounded-xl px-3 py-2.5">
                <span className="text-accent shrink-0">{b.icon}</span>
                <div>
                  <p className="text-xs font-semibold leading-tight">{b.title}</p>
                  <p className="text-[11px] text-muted leading-tight">{b.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery note */}
          <div className="mt-4 flex items-center gap-2 text-xs text-muted bg-accent/5 border border-accent/15 rounded-xl px-4 py-2.5">
            <svg className="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Поръчай сега — доставка в рамките на 1–2 работни дни. Плащане с наложен платеж.
          </div>
        </div>
      </div>

      {/* Description tabs */}
      {cleanDescription && (
        <ProductDescriptionTabs description={cleanDescription} attributes={p.attributes ?? []} />
      )}

      {/* Related products */}
      {related && related.length > 0 && (
        <section className="mt-16 border-t border-border pt-12">
          <h2 className="text-xl font-black mb-6">Подобни продукти</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/products/${r.slug}`}
                className="group bg-surface border border-border rounded-xl overflow-hidden hover:border-accent transition-all"
              >
                {r.images?.[0] && (
                  <div className="aspect-square overflow-hidden bg-surface-2">
                    <img
                      src={r.images[0]}
                      alt={r.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-3">
                  <p className="text-xs font-semibold line-clamp-2 mb-1.5">{r.name}</p>
                  <p className="text-accent font-bold text-sm">{Number(r.sale_price ?? r.price).toFixed(2)} €</p>
                  <p className="text-muted/50 text-[11px]">{(Number(r.sale_price ?? r.price) * 1.95583).toFixed(2)} лв.</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
