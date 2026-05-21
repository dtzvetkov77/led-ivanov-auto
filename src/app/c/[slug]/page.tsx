import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductGrid from '@/components/ProductGrid'
import Link from 'next/link'
import { JsonLd } from '@/components/JsonLd'
import { CATEGORY_PAGE_CONFIGS } from '@/lib/categoryPages'
import type { Product } from '@/lib/types'

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.ledivanovauto.com').replace('http://localhost:3000', 'https://www.ledivanovauto.com')

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return Object.keys(CATEGORY_PAGE_CONFIGS).map(slug => ({ slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const config = CATEGORY_PAGE_CONFIGS[slug]
  if (!config) return {}
  return {
    title: config.title,
    description: config.metaDescription,
    alternates: { canonical: `/c/${slug}` },
    openGraph: {
      title: config.title,
      description: config.metaDescription,
      url: `${SITE}/c/${slug}`,
    },
  }
}

export default async function CategoryLandingPage({ params }: Props) {
  const { slug } = await params
  const config = CATEGORY_PAGE_CONFIGS[slug]
  if (!config) notFound()

  const supabase = await createClient()

  let products: Product[] = []

  if (config.categorySlug) {
    const { data: cats } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', config.categorySlug)
    const catIds = (cats ?? []).map(c => c.id)
    if (catIds.length > 0) {
      const { data: pc } = await supabase
        .from('product_categories')
        .select('product_id')
        .in('category_id', catIds)
      const ids = (pc ?? []).map(r => r.product_id)
      if (ids.length > 0) {
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('published', true)
          .in('id', ids)
          .order('position')
        products = (data ?? []) as Product[]
      }
    }
  }

  if (products.length === 0 && config.searchTerms?.length) {
    let query = supabase.from('products').select('*').eq('published', true)
    const term = config.searchTerms[0]
    query = query.ilike('name', `%${term}%`)
    const { data } = await query.order('position')
    products = (data ?? []) as Product[]

    if (products.length === 0 && config.searchTerms.length > 1) {
      for (const t of config.searchTerms.slice(1)) {
        const { data: extra } = await supabase
          .from('products')
          .select('*')
          .eq('published', true)
          .ilike('name', `%${t}%`)
          .order('position')
        const ids = new Set(products.map(p => p.id))
        for (const p of (extra ?? []) as Product[]) {
          if (!ids.has(p.id)) products.push(p)
        }
      }
    }
  }

  const itemListSchema = products.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: config.h1,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 10).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE}/products/${p.slug}`,
      name: p.name,
    })),
  } : null

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Начало', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Продукти', item: `${SITE}/products` },
      { '@type': 'ListItem', position: 3, name: config.breadcrumb, item: `${SITE}/c/${slug}` },
    ],
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {itemListSchema && <JsonLd data={itemListSchema} />}
      <JsonLd data={breadcrumbSchema} />

      {/* Breadcrumb */}
      <nav className="text-xs text-muted mb-6 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-white transition-colors">Начало</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-white transition-colors">Продукти</Link>
        <span>/</span>
        <span className="text-white">{config.breadcrumb}</span>
      </nav>

      <h1 className="text-3xl font-black mb-3">{config.h1}</h1>
      <p className="text-muted text-sm mb-8 leading-relaxed">{config.metaDescription}</p>

      {/* SEO body text — full width, columns on desktop */}
      <section className="mb-10">
        <div className="columns-1 md:columns-2 gap-8">
          {config.body.split('\n\n').map((para, i) => {
            if (para.startsWith('**') || para.includes('**')) {
              const parts = para.split(/(\*\*[^*]+\*\*)/)
              return (
                <p key={i} className="text-muted text-sm leading-relaxed mb-4 break-inside-avoid">
                  {parts.map((part, j) =>
                    part.startsWith('**') && part.endsWith('**')
                      ? <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>
                      : part
                  )}
                </p>
              )
            }
            if (para.startsWith('- ')) {
              const items = para.split('\n').filter(l => l.startsWith('- '))
              return (
                <ul key={i} className="list-disc list-inside text-muted text-sm mb-4 space-y-1 break-inside-avoid">
                  {items.map((item, j) => <li key={j}>{item.slice(2)}</li>)}
                </ul>
              )
            }
            if (para.length > 60 && !para.startsWith('-')) {
              const isHeading = para.length < 120 && !para.includes('. ')
              return isHeading
                ? <h2 key={i} className="text-white font-bold text-base mt-6 mb-2 break-inside-avoid">{para}</h2>
                : <p key={i} className="text-muted text-sm leading-relaxed mb-4 break-inside-avoid">{para}</p>
            }
            return <p key={i} className="text-muted text-sm leading-relaxed mb-4 break-inside-avoid">{para}</p>
          })}
        </div>
      </section>

      {/* Products */}
      {products.length > 0 ? (
        <div className="mb-14">
          <h2 className="text-xl font-black mb-6">Продукти</h2>
          <ProductGrid products={products} />
        </div>
      ) : (
        <div className="mb-14 py-12 text-center text-muted border border-border rounded-xl">
          <p className="text-lg font-semibold mb-2">Очаквайте скоро</p>
          <p className="text-sm">Разглеждайте пълния ни каталог или се свържете с нас за наличност.</p>
          <Link href="/products" className="inline-block mt-4 bg-accent text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-accent-hover transition-colors">
            Виж всички продукти
          </Link>
        </div>
      )}

      {/* FAQ */}
      {config.faq.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-black mb-6">Често задавани въпроси</h2>
          <div className="space-y-4">
            {config.faq.map((item, i) => (
              <div key={i} className="bg-surface border border-border rounded-xl p-5">
                <h3 className="font-bold text-sm mb-2">{item.q}</h3>
                <p className="text-muted text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-surface border border-border rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1">
          <h2 className="text-lg font-black mb-1">Не намирате точния продукт?</h2>
          <p className="text-muted text-sm">Свържете се с нас — ще ви помогнем да изберете правилната LED крушка за вашия автомобил.</p>
        </div>
        <Link
          href="/contact"
          className="shrink-0 bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-lg font-bold text-sm transition-colors"
        >
          Свържете се с нас
        </Link>
      </section>
    </div>
  )
}
