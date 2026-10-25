import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductGrid from '@/components/ProductGrid'
import Link from 'next/link'
import { JsonLd } from '@/components/JsonLd'
import { CATEGORY_PAGE_CONFIGS } from '@/lib/categoryPages'
import type { Product } from '@/lib/types'
import { getArticle, type Article } from '@/lib/articles'

const ACCESSORY = /модул|резистор|декодер|адаптер|преходни|кабел|букс|ключодърж|стикер/i

const GUIDES: Record<string, string[]> = {
  'led-krushki-za-kola': ['led-krushki-za-kola-kak-da-izberem', 'led-krushki-za-kola-ceni', 'led-krushki-za-avtomobil-vsichko'],
  'led-krushki-h7': ['led-krushki-h7-110w-180w-200w', 'montazh-led-krushki-h7', 'led-krushki-greshka-migane-smushtenia'],
  'led-krushki-h4': ['led-krushki-h4-kasi-i-dalgi', 'led-krushki-sveti-slabo-razseyana-svetlina', 'zakonni-li-sa-led-krushkite'],
  'led-krushki-h11': ['led-krushki-za-mygla-h11-h8', 'kakva-krushka-e-moyata-kola', 'nai-dobrite-led-krushki'],
  'led-krushki-h1': ['kakva-krushka-e-moyata-kola', 'led-krushki-za-avtomobil-vsichko', 'led-krushki-za-mygla-h11-h8'],
  'ksenon-krushki': ['led-zamestitel-na-ksenon-d1s-d2s-d3s', 'led-vs-ksenon-vs-halogen', 'nai-dobrite-led-krushki'],
  'dnevni-svetlini': ['led-krushki-za-avtomobil-vsichko', 'led-vs-ksenon-vs-halogen', 'nai-dobrite-led-krushki'],
  'led-krushki-canbus': ['led-krushki-greshka-migane-smushtenia', 'montazh-led-krushki-h7', 'led-krushki-za-avtomobil-vsichko'],
  'led-krushki-po-marka': ['led-krushki-za-kola-po-marki', 'kakva-krushka-e-moyata-kola', 'prehodnici-za-led-krushki'],
  'led-krushki-za-vw': ['led-krushki-za-vw-golf-4-5-6-7', 'prehodnici-za-led-krushki', 'led-krushki-za-kola-po-marki'],
  'led-krushki-za-bmw': ['kakvo-e-canbus-led-krushki', 'led-zamestitel-na-ksenon-d1s-d2s-d3s', 'led-krushki-za-kola-po-marki'],
  'led-krushki-za-mercedes': ['kakvo-e-canbus-led-krushki', 'led-krushki-greshka-migane-smushtenia', 'led-krushki-za-kola-po-marki'],
  'led-krushki-za-audi': ['led-zamestitel-na-ksenon-d1s-d2s-d3s', 'kakvo-e-canbus-led-krushki', 'led-krushki-za-kola-po-marki'],
  'led-krushki-za-toyota': ['led-krushki-hb3-hb4-9005-9006', 'led-krushki-za-mygla-h11-h8', 'led-krushki-za-kola-po-marki'],
  'led-krushki-za-honda': ['led-krushki-hb3-hb4-9005-9006', 'prehodnici-za-led-krushki', 'led-krushki-za-kola-po-marki'],
  'led-krushki-za-mazda': ['led-krushki-hb3-hb4-9005-9006', 'led-krushki-za-mygla-h11-h8', 'led-krushki-za-kola-po-marki'],
  'led-krushki-za-dacia': ['led-krushki-h4-kasi-i-dalgi', 'zaslepyavat-li-led-krushkite', 'led-krushki-za-kola-po-marki'],
  'led-krushki-za-fiat': ['led-krushki-h4-kasi-i-dalgi', 'zaslepyavat-li-led-krushkite', 'led-krushki-za-kola-po-marki'],
}

const BRAND_GUIDES = ['led-krushki-za-kola-po-marki', 'prehodnici-za-led-krushki', 'kakvo-e-canbus-led-krushki']

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.ledivanovauto.com').replace('http://localhost:3000', 'https://www.ledivanovauto.com')

type Props = { params: Promise<{ slug: string }> }

// Body text supports **bold** and [text](/url) inline.
function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/).map((part, j) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (link) {
      return <Link key={j} href={link[2]} className="text-accent hover:underline">{link[1]}</Link>
    }
    return part
  })
}

export async function generateStaticParams() {
  return Object.keys(CATEGORY_PAGE_CONFIGS).map(slug => ({ slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const config = CATEGORY_PAGE_CONFIGS[slug]
  if (!config) return {}
  return {
    title: { absolute: config.title },
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
    const seen = new Set<string>()
    for (const t of config.searchTerms) {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('published', true)
        .ilike('name', `%${t}%`)
        .order('position')
      for (const p of (data ?? []) as Product[]) {
        if (!seen.has(p.id)) { seen.add(p.id); products.push(p) }
      }
    }
  }

  if (config.excludeTerms?.length) {
    const ex = config.excludeTerms.map(t => t.toLowerCase())
    products = products.filter(p => !ex.some(t => p.name.toLowerCase().includes(t)))
  }

  // Bulbs first, accessories (modules, adapters, decoders) after — stable sort keeps DB position.
  products = products
    .map((p, i) => ({ p, i, acc: ACCESSORY.test(p.name) ? 1 : 0 }))
    .sort((a, b) => a.acc - b.acc || a.i - b.i)
    .map(x => x.p)

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
      <p className="text-muted text-sm mb-6 leading-relaxed max-w-3xl">{config.metaDescription}</p>

      {/* Products */}
      {products.length > 0 ? (
        <div className="mb-14">
          <h2 className="text-xl font-black mb-4">Продукти <span className="text-muted text-sm font-semibold">({products.length})</span></h2>
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

      {/* SEO body text — full width, columns on desktop */}
      <section className="mb-14 pt-10 border-t border-border">
        <div className="columns-1 md:columns-2 gap-8">
          {config.body.split('\n\n').map((para, i) => {
            if (para.startsWith('## ')) {
              return <h2 key={i} className="text-white font-bold text-base mt-6 mb-2 break-inside-avoid">{para.slice(3)}</h2>
            }
            if (para.startsWith('- ')) {
              const items = para.split('\n').filter(l => l.startsWith('- '))
              return (
                <ul key={i} className="list-disc list-inside text-muted text-sm mb-4 space-y-1 break-inside-avoid">
                  {items.map((item, j) => <li key={j}>{inline(item.slice(2))}</li>)}
                </ul>
              )
            }
            const isHeading = para.length > 60 && para.length < 120 && !para.includes('. ') && !/[*\[]/.test(para)
            return isHeading
              ? <h2 key={i} className="text-white font-bold text-base mt-6 mb-2 break-inside-avoid">{para}</h2>
              : <p key={i} className="text-muted text-sm leading-relaxed mb-4 break-inside-avoid">{inline(para)}</p>
          })}
        </div>
      </section>

      {/* Guides */}
      {(() => {
        const guides = (GUIDES[slug] ?? (slug.startsWith('led-krushki-za-') ? BRAND_GUIDES : [])).map(getArticle).filter((a): a is Article => !!a)
        if (!guides.length) return null
        return (
          <section className="mb-12">
            <h2 className="text-xl font-black mb-6">Полезни ръководства</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {guides.map(g => (
                <Link key={g.slug} href={`/blog/${g.slug}`} className="bg-surface border border-border hover:border-accent/60 rounded-xl p-4 text-sm font-semibold leading-snug transition-colors">
                  {g.title}
                </Link>
              ))}
            </div>
          </section>
        )
      })()}

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
